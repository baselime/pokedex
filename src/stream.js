const logger = require("@baselime/logger");

async function command(e) {
    const requests = e.Records.map(el => JSON.parse(Buffer.from(el.kinesis.data, 'base64').toString('utf-8')))
    logger.info("The events to stream", requests)
}

/**
 * 
 * @param {import("aws-lambda").KinesisStreamEvent} e 
 */
module.exports.handler = async (e, context) => {
    await logger.bindFunction(command, context.awsRequestId)(e);
}