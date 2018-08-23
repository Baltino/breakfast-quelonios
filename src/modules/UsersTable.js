const AWS = require('aws-sdk')
const moment = require('moment');
const USERS_TABLE = require('./constants').USERS_TABLE;
const uuidv4 = require('uuid/v4')
const User = require('./User')

class CitiesTable {
  constructor (db, name) {
    const IS_OFFLINE = process.env.IS_OFFLINE;

    if (IS_OFFLINE === 'true') {
      console.log('IS OFFLINE')
      this.db = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    } else {
      this.db = new AWS.DynamoDB.DocumentClient();
    };
    this.TABLE_NAME = USERS_TABLE
  }

  getUsers() {
    const params = {
      TableName: this.TABLE_NAME,
      ScanIndexForward: true,
    }

    return this.db.scan(params)
      .promise()
      .then(data => data.Items.sort((a,b) => moment(a.lastBring) < moment(b.lastBring)))
  }

  addUser(_user) {
    const user = new User(_user);
    const verification = user.verifyFields();
    const params = {
      TableName: this.TABLE_NAME,
      Item: {
        name: user.data.name,
        email: user.data.email,
        avatar: user.data.avatar,
        lastBring: user.data.lastBring
      }
    }
    if(verification.error) { return new Promise((res) => { res(verification); }) }
    
    return this.db.put(params)
      .promise()
      .then((res) => user.data);
  }

  updateLastBring(_user) {
    const user = new User(_user);
    const response = user.generateUpdateLastBringQuery();
    const params = { 
      TableName: this.TABLE_NAME,
      Key: { 
        email: user.data.email
      }, 
      UpdateExpression: response.query,
      ExpressionAttributeValues: response.values, 
      ReturnValues:"ALL_NEW"
    };
    return this.db.update(params)
      .promise()
      .then(data => data.Attributes );
  }

  
  getUserByEmail(email) {
    const params = {
      TableName: this.TABLE_NAME,
      Key: {
        email,
      }
    }

    return this.db.get(params)
      .promise()
      .then(data => data.Item)
  }

}

module.exports = CitiesTable
