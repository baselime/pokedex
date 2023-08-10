require('./signing-workaround');
const { logger, wrap } = require("@baselime/lambda-logger");
const { increment } = require("./counter");
const kinesis = require("./kinesis");

exports.handler = wrap(async function (event, context) {

  const message = event.Records[0].Sns.Message;
  await increment();
  logger.info("Handling Message", {
    message,
    requestId: context.awsRequestId,
  });

  await kinesis
    .putRecord({
      StreamName: process.env.KINESIS || "poke-search-stream-prod",
      Data: JSON.stringify({
        requestId: context.awsRequestId,
      }),
      PartitionKey: context.awsRequestId,
    })
    .promise();

  if (Math.random() > 0.9) {
    throw Error(
      "MailDude is down due to a catastrophic server failure. Your message was not delivered. Please retry",
    );
  }
});