// @ts-nocheck
"use strict";
// @ts-ignore
const { wrap, logger } = require("@baselime/lambda-logger");
import {
	// @ts-ignore
	CacheGet,
	// @ts-ignore
	CreateCache,
	// @ts-ignore
	CacheSet,
	CacheClient,
	Configurations,
	CredentialProvider,
} from '@gomomento/sdk';
const AWSXRay = require("aws-xray-sdk");
const errorMessage = require("./error");
const { increment } = require("./counter");
const kinesis = require('./kinesis');
const db = require("./db");

const SNS = require("aws-sdk/clients/sns");

const sns = new SNS({ region: 'eu-west-1' });

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

exports.handler = wrap(async function (event, context) {
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
		// @ts-ignore
		if (!result.Items[0]) {
			const data = { message: "Pokemon not found" };
			logger.error(data.message, {
				lang,
				name
			}, Error(data.message));
			return buildResponse(data, 404);
		}

		// @ts-ignore
		const pokemon = result.Items[0]; 
		const data = { pokemon };
		logger.info("Pokemon Found", {
			data,
			name,
			lang,
		});

		await signalToSns(pokemon);
		return buildResponse(data, 200);
	} catch (error) {
		const message = errorMessage();
		// @ts-ignore
		logger.error(message, error)
		return buildResponse({ message: message }, 500);
	}
});

async function signalToSns(pokemon) {
	await sns
		.publish({
			TopicArn: process.env.TOPIC_ARN || "arn:aws:sns:eu-west-1:522104763258:poke-topic-prod",

			Message: JSON.stringify({
				event: "POKEMON_FOUND",
				message: pokemon,
			}),
			MessageAttributes: {
				type: { DataType: "String", StringValue: "pokemon" },
			},
		})
		.promise();
}