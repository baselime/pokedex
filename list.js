"use strict";
const db = require("./db");
const numPerPage = 10;

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

module.exports.handler = async (event, context) => {
	const requestId = context.awsRequestId;

	const limit = Number(event.queryStringParameters?.limit) || 100;
	const start = Number(event.queryStringParameters?.start) || undefined;

	console.log(
		JSON.stringify({ message: "REQUEST", extra: { event, limit, start, requestId } }),
	);
	try {
		const pokemons = await db
			.scan({
				TableName: "baselime-pokedex-prod",
				Limit: limit,
				ExclusiveStartKey: start && { id: start },
			})
			.promise();

		const data = { pokemons };
		console.log(
			JSON.stringify({
				message: "RESPONSE",
				extra: {
					endpoint: "GET /",
					path: event.path,
					data,
					code: 200,
					requestId,
				},
			}),
		);
		return buildResponse(data, 200);
	} catch (error) {
		console.error(
			JSON.stringify({
				message: "Unexpected error when getting a pokemon",
				extra: { error, code: 500, requestId, limit, start },
			}),
		);
		console.error(
			JSON.stringify({
				message: "RESPONSE",
				extra: {
					endpoint: "GET /",
					path: event.path,
					code: 500,
					requestId,
					limit,
          start
				},
			}),
		);
		return buildResponse({ message: error.message }, 500);
	}
};
