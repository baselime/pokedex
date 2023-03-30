"use strict";

const logger = require("@baselime/logger");
const errorMessage = require("./error");
const db = require("./db");
const kinesis = require('./kinesis');
function buildResponse(data, code) {
	return {
		statusCode: code,
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": true,
		},
		body: JSON.stringify(data),
	};
}

module.exports.handler = async (event) => {
	logger.info(
		`${event.requestContext.httpMethod} ${event.requestContext.path} - ${event.requestContext.requestId}`,
		{
			requestId: event.requestContext.requestId,
		},
	);
    await kinesis.putRecord({
		StreamName: process.env.KINESIS || 'poke-search-stream-prod',
		Data: JSON.stringify(event.requestContext),
		PartitionKey: event.requestContext.requestId,
	}).promise();
	try {
		const result = await db
			.get({
				TableName: "baselime-pokedex-prod-counter",
				Key: {
                    id: 'pokedex'
                }
			})
			.promise();
		

		const data = { stats: result.Item };
		logger.info("Pokedex Analytics", {
			data,
		})
		return buildResponse(data, 200);
	} catch (error) {
		const message = errorMessage();
		logger.error(message, {
			message: error.message,
		})
		return buildResponse({ message: message }, 500);
	}
};
