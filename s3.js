const AWSXRay = require('aws-xray-sdk');
const S3 = require('aws-sdk/clients/s3');

const client = new S3()

AWSXRay.captureAWSClient(client);

module.exports = client;