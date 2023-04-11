"use strict";
const { wrap, logger } = require("@baselime/lambda-logger");
const errorMessage = require("./error");
const { increment} = require("./counter");
const kinesis = require('./kinesis');
const db = require("./db");

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

module.exports.handler = wrap(async (event, context) => {
	const requestId = context.awsRequestId;
	const { name } = event.pathParameters;
	const lang = event.queryStringParameters?.lang || "en";
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
	const rand = Math.random();
	const threshold = name === "Fearow" ? 1 : 0;
	if (rand < threshold) {
		const message = errorMessage();
		logger.error(message, {
			extra: { rand, path: event.path, requestId, name },
		}, Error(message));
		
		throw new Error(message);
	}

	try {
		const result = await db
			.query({
				TableName: "baselime-pokedex-prod",
				IndexName: `${lang}-name-index`,
				KeyConditionExpression: "#DDB_game = :pkey and #DDB_en = :skey",
				ExpressionAttributeNames: {
					"#DDB_game": "game",
					"#DDB_en": lang,
				},
				ExpressionAttributeValues: {
					":pkey": "pokemon",
					":skey": name,
				},
			})
			.promise();
		if (!result.Items[0]) {
			const data = { message: "Pokemon not found" };
			logger.error(data.message, {
				lang,
				name
			}, Error(data.message));
			return buildResponse(data, 404);
		}

		const data = { pokemon: result.Items[0] };
		logger.info("Pokemon Found", {
			data,
			search: name,
			lang
		})
		return buildResponse(data, 200);
	} catch (error) {
		const message = errorMessage();
		logger.error(message, error)
		return buildResponse({ message: message }, 500);
	}
});
