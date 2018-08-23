### Desayunos serverless module
Serveless and SES ready to work on.


sls dynamodb install
`npm install`
 sls plugin install --name serverless-dynamodb-local

#Run
`npm start`

#debug 
Download DynamoDB shell: http://dynamodb-local.s3-website-us-west-2.amazonaws.com/dynamodb_local_2015-07-16_1.0.tar.gz 
Extract it
`java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar`


#For tests
No tests for now
`npm i -g mocha`

`mocha handler.test.js --compilers js:babel-core/register`

fuser -k -n tcp 3000
