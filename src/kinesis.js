const Kinesis = require('aws-sdk/clients/kinesis');
const AWSXRay = require('aws-xray-sdk');

module.exports = AWSXRay.captureAWSClient(new Kinesis())