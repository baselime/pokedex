"use strict";
const { create, insertBatch, search } = require("@lyrasearch/lyra");
var AWSXRay = require("aws-xray-sdk");
const s3 = require("./s3");
const logger = require("@baselime/logger");
const { increment } = require("./counter");
const errorMessage = require("./error");
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
let lyra;

/**
 *
 * @param {import("aws-lambda").APIGatewayProxyEvent} event
 * @param {import("aws-lambda").Context} context
 * @returns
 */
module.exports.handler = async (event, context) => {
	const requestId = context.awsRequestId;
	const term = event.queryStringParameters?.term || "Bulbasaur";

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
		const segment = AWSXRay.getSegment();
		if (!lyra) {
			//returns the facade segment
			const subsegment = segment?.addNewSubsegment("creating lyra");
			let data;

			try {
				const file = await s3
					.getObject({
						Bucket: "poke-search-bucket-prod",
						Key: "pokedex.json",
					})
					.promise();
				data = { pokemon: JSON.parse(file.Body.toString()) };
			} catch (e) {
				logger.error("Failed to find pokedex in s3", {
					Bucket: "poke-search-bucket-prod",
					Key: "pokedex.json",
				});

				const pokemon = require("../data/pokedex.json");
				await s3
					.putObject({
						Bucket: "poke-search-bucket-prod",
						Key: "pokedex.json",
						Body: JSON.stringify(pokemon),
					})
					.promise();
				data = { pokemon };
			}
			logger.info(`Seeding the pokedex search engine with ${data.pokemon.length}`, {
				pokemon: data.pokemon.length,
				schema: {
					id: "string",
					name: {
						english: "string",
						japanese: "string",
						chinese: "string",
						french: "string",
					},
					type: "string[]",
					base: {
						HP: "number",
						Attack: "number",
						Defense: "number",
						"Sp. Attack": "number",
						"Sp. Defense": "number",
						Speed: "number",
					},
				},
			});
			lyra = await create({
				schema: {
					id: "string",
					name: {
						english: "string",
						japanese: "string",
						chinese: "string",
						french: "string",
					},
					type: "string[]",
					base: {
						HP: "number",
						Attack: "number",
						Defense: "number",
						"Sp. Attack": "number",
						"Sp. Defense": "number",
						Speed: "number",
					},
				},
			});
			const subsubsegment = subsegment?.addNewSubsegment("feeding lyra");
			subsegment?.addAttribute("pokedexSize", data.pokemon.length);
			await insertBatch(
				lyra,
				data.pokemon.map((el) => {
					el.id = el.id.toString();
					return el;
				}),
			);
			subsubsegment?.close();

			subsegment?.close();
		}

		const subsegment = segment?.addNewSubsegment("searching lyra");
		subsegment?.addMetadata("term", term);

		const searchResult = await search(lyra, {
			term,
			properties: "*",
		});
		subsegment?.addAttribute("matched", searchResult.count);
		subsegment?.close();

		logger.info("Pokemon Found", {
			data: searchResult.hits,
			search: term
		})
		
		return buildResponse(searchResult.hits, 200);
	} catch (error) {
		const message= errorMessage()
		logger.error(message, {
			message: error.message,
		});
		return buildResponse({ message: message }, 500);
	}
};
