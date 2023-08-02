import('./signing-workaround');
import { logger, baselimeMiddyMiddleware } from "@baselime/lambda-logger";
import middy from "@middy/core";

exports.handler = middy()
	.use(baselimeMiddyMiddleware())
	.handler(async function (e, context) {
		const requests = e.Records.map((el) =>
			Buffer.from(el.kinesis.data, "base64").toString("utf-8"),
		);
		logger.info("The events to stream", requests);
	});
