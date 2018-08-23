import { SERVER_ERROR, getHeaders } from './utils';
import axios from 'axios';
import AWS from 'aws-sdk';
// importing config file which contains AWS key
// Best practice: to use a config.copy.json when pushing to github
// Coz exposing the AWS keys to public is not good
import config from './../config.json';

AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

// Instatiating the SES from AWS SDK
const ses = new AWS.SES();

const Users = require('./modules/Users')
const moment = require('moment')
const LUNES = 1, MIERCOLES = 4;//3

module.exports.addUser = (event, context, callback) => {
  const users = new Users();
  try {
    users.add(JSON.parse(event.body))
      .then(res => {
        const response = {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify(res)
        };
        callback(null, response)
      })
      .catch(err => {
        const response = {
          statusCode: 409,
          headers: getHeaders(),
          body: JSON.stringify({
            message: 'Could not add user',
            error: err,
          })
        };
        callback(null, response)
      })
  }catch(e) { callback(null, SERVER_ERROR(e)) }
}

function sendNotifications(user, users) {
  //ses render template
  //send
  const date = moment();
  const data = {
    user,
    fbIdBehalf: config.fbIdBehalf,
    positionsTable: '<ul>'+users.map(u => `<li>${u.name} trajo por última vez el ${moment(u.lastBring).format('DD-MM-YYYY')}</li>`).join('')+'</ul>'
  }
  //if lunes o miercoles
  if(date.isoWeekday() === LUNES) {
    data.today = 'Lunes';
    data.tomorrow = 'Martes';
  }else {
    if(date.isoWeekday() === MIERCOLES) {
      data.today = 'Miércoles';
      data.tomorrow = 'Jueves';
    }else {
      throw 'fail'
    }
  }
  
  
  console.log('cool, going to send')
  //giphy
  axios.get('https://api.giphy.com/v1/gifs/random?api_key=HIkq7qaIstScFre01MaomnhGDHMYAmPt&tag=funny')
    .then((res) => {
      const emailParams = {
        Destination: { 
          ToAddresses: [
            'jose.maximiliano.aragon@gmail.com',
          ]
        },
        ConfigurationSetName: "desayuno_email_config",//configuration for sending when fails
        Source: 'jose.maximiliano.aragon@gmail.com', /* required */
        Template: 'desayuno', /* required */
        TemplateData: JSON.stringify({ ...data, giphy: res.data.data.image_url }),
      };
      ses.sendTemplatedEmail(emailParams, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
          console.log("SES successful");
        }
      });
    })
}

module.exports.sendNotifications = (event, context, callback) => {
  const date = moment();
  //if lunes o miercoles
  if(date.isoWeekday() === LUNES || date.isoWeekday() === MIERCOLES) {
    const usersInstance = new Users();
    try {
      //get users
      usersInstance.getAll()
        .then(users => {
          const orderedUsers = users.sort((a, b) => moment(a.lastBring) > moment(b.lastBring) );
          //get older user that lastBring
          const olderUserBringing = orderedUsers[0];
          //send mail to all with that user
          sendNotifications(olderUserBringing, orderedUsers)
          //update older user lastbring with today
          return usersInstance.justBrought(olderUserBringing);
        })
        .then(res => {
          const response = {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              message: 'Yes',
              res: res,
            })
          };
          callback(null, response)
        })
    }catch(e) { callback(null, SERVER_ERROR(e)) }
  }else {
    const response = {
      statusCode: 200,
      headers: getHeaders(),
      body: JSON.stringify({
        message: 'Yes',
        res: 'No es un dia adecuado para enviar los recordatorios',
      })
    };
    callback(null, response)
  }
  
  
  
}