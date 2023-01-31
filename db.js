const AWSXRay = require('aws-xray-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');

const client = new DynamoDB.DocumentClient({
  service: new DynamoDB()
});

AWSXRay.captureAWSClient(client.service);

module.exports = client;