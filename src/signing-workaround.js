const SignersV4 = require('aws-sdk/lib/signers/v4')

SignersV4.prototype.unsignableHeaders.push('traceparent');
