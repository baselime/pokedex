"use strict";
require('./signing-workaround');
const {logger, wrap } = require("@baselime/lambda-logger");
const errorMessage = require("./error");
const db = require("./db");
const { increment } = require("./counter");
const numPerPage = 10;
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


exports.handler = wrap(async function(event, context) {
	const requestId = context.awsRequestId;

	const limit = Number(event.queryStringParameters?.limit) || numPerPage;
	const start = Number(event.queryStringParameters?.start) || undefined;
	
	logger.info(
		`${event.requestContext.httpMethod} ${event.requestContext.path} - ${event.requestContext.requestId}`,
		{
			queryString: event.queryStringParameters,
			requestId: event.requestContext.requestId,
		},
	);
	await kinesis.putRecord({
		StreamName: process.env.KINESIS || 'poke-search-stream-prod',
		Data: JSON.stringify(event.requestContext),
		PartitionKey: event.requestContext.requestId,
	}).promise();
	await increment();
	try {
		const pokemons = await db
			.scan({
				TableName: Math.random() > 0.05 ? "baselime-pokedex-prod" : "not-a-table",
				Limit: limit,
				ExclusiveStartKey: start && { id: start },
			})
			.promise();

		const data = pokemons;
		logger.info("Found a list of pokemon", {
			pokemon: data.Items?.length
		});
		
		return buildResponse(data, 200);
	} catch (error) {
		const message = errorMessage();
		logger.error(message, {
			message: error.message,
		})
		return buildResponse({ message: message }, 500);
	}
});