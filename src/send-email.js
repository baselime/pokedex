const X = require("aws-xray-sdk");
const logger = require("@baselime/logger");
const { increment } = require("./counter");
const kinesis = require("./kinesis");

/**
 *
 * @param {import("aws-lambda").SQSEvent} e
 * @returns
 */
async function command(e, context) {
	for (const record of e.Records) {
		const { Message, MessageAttributes } = JSON.parse(record.body);
		await increment();
		const data = JSON.parse(Message);
		const type = MessageAttributes.type.Value;
		logger.info("Handling Message", {
			data,
			type,
			requestId: context.awsRequestId,
		});

		await kinesis
			.putRecord({
				StreamName: process.env.KINESIS || "poke-search-stream-prod",
				Data: JSON.stringify({
					type,
					requestId: context.awsRequestId,
				}),
				PartitionKey: context.awsRequestId,
			})
			.promise();

		const segment = X.getSegment();
		const subb = segment?.addNewSubsegment("Sending Email");
		subb?.addMetadata("to", data.to);
		subb?.addMetadata("from", data.from);
		subb?.addMetadata("message", data.message);
		await new Promise((resolve) => setTimeout(resolve, 349));
		if (Math.random() > 0.8) {
			throw Error(
				"MailDude is down due to a catastrophic server failure. Your message was not delivered. Please retry",
			);
		}
		subb?.addMetadata("response", "OK");
		subb?.close();
	}
}

/**
 *
 * @param {import("aws-lambda").SQSEvent} e
 * @param {import("aws-lambda").Context} context
 * @returns
 */
exports.handler = async (e, context) => {
	await logger.bindFunction(command, context.awsRequestId)(e);
};
