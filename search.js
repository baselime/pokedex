"use strict";
const { create, insertBatch, search } = require("@lyrasearch/lyra");
var AWSXRay = require('aws-xray-sdk');
const s3 = require("./s3");

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
module.exports.handler = async (event, context) => {
	const requestId = context.awsRequestId;
	const term = event.queryStringParameters?.term || "Bulbasaur";
	console.log(
		JSON.stringify({ message: "REQUEST", extra: { event, requestId } }),
	);
	try {
        const segment = AWSXRay.getSegment();
		if (!lyra) {
             //returns the facade segment
            const subsegment = segment.addNewSubsegment('creating lyra');
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
                console.log(e)
				console.log(
					JSON.stringify({
						message: "Failed to find pokedex in s3",
						extra: {
							Bucket: "poke-search-bucket-prod",
							Key: "pokedex.json",
						},
					}),
				);
				const pokemon = require("./data/pokedex.json");
				await s3
					.putObject({
						Bucket: "poke-search-bucket-prod",
						Key: "pokedex.json",
						Body: JSON.stringify(pokemon),
					})
					.promise();
				data = { pokemon };
			}
            console.log(JSON.stringify({
                message: 'creating lyra'
            }))
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
            const subsubsegment = subsegment.addNewSubsegment('feeding lyra')
            subsegment.addAttribute('pokedexSize', data.pokemon.length)
			await insertBatch(
				lyra,
				data.pokemon.map((el) => {
					el.id = el.id.toString();
					return el;
				}),
			);
            subsubsegment.close()

            subsegment.close()
		}

        const subsegment = segment.addNewSubsegment('searching lyra');
        subsegment.addMetadata('term', term)
        
		const searchResult = await search(lyra, {
			term,
			properties: "*",
		});
        subsegment.addAttribute('matched', searchResult.count)
        subsegment.close();

		console.log(
			JSON.stringify({
				message: "RESPONSE",
				extra: {
					endpoint: "GET /search",
					path: event.path,
					data: searchResult.hits,
					code: 200,
					requestId,
				},
			}),
		);
		return buildResponse(searchResult.hits, 200);
	} catch (error) {
		console.log(error);
		console.error(
			JSON.stringify({
				message: "Unexpected error when getting a pokemon",
				extra: { error, code: 500, requestId },
			}),
		);
		console.error(
			JSON.stringify({
				message: "RESPONSE",
				extra: {
					endpoint: "GET /{name}",
					path: event.path,
					code: 500,
					requestId,
				},
			}),
		);
		return buildResponse({ message: "Unexpected error" }, 500);
	}
};
