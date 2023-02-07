const X = require('aws-xray-sdk');
X.capturePromise();

exports.handler = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('hello')
}