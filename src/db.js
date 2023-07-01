const DynamoDB = require('aws-sdk/clients/dynamodb');

const client = new DynamoDB.DocumentClient({
  service: new DynamoDB()
});

module.exports = client;