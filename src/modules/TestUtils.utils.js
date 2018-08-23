import dynalite from 'dynalite';
import AWS from 'aws-sdk';


var dynaliteServer = dynalite({createTableMs: 50});
var USERS_TABLE = require('./constants').USERS_TABLE;

module.exports.mockDB = () => {
  AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:4567"
  });

  var dynamodb = new AWS.DynamoDB();

  return new Promise((resolve, reject) => {
     dynaliteServer.listen(4567, function(err) {
       dynamodb.listTables({},function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        if(data.TableNames.length <= 0){
          dynamodb.createTable({
            TableName : USERS_TABLE,
            KeySchema: [
              { AttributeName: "email", KeyType: "HASH"},  //Partition key
              //{ AttributeName: "email", KeyType: "RANGE" }  //Sort key
            ],
            AttributeDefinitions: [
              { AttributeName: "email", AttributeType: "S" },
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: 1,
              WriteCapacityUnits: 1
            },
          },
          function(err, data) {
            if (err) {
              console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
              reject(err);
            } else {
            setTimeout(()=>{
              resolve(data);
            },1000)
            }
          });
         }
         else{ resolve(); }
      }
        });
    });
  });
}