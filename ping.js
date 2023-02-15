const util = require("util");
const SNS = require("aws-sdk/clients/sns");

const X = require("aws-xray-sdk");
const axios = require("axios");

const sns = X.captureAWSClient(new SNS());
const wait = util.promisify(setTimeout);
const url = "https://a43hiiwt6d.execute-api.eu-west-1.amazonaws.com/prod/";

function random(min, max) {
	return Math.ceil(Math.random() * (max - min) + min);
}
function search(term) {
	return axios.get(`${url}search?term${term}`);
}

function get(name) {
	return axios.get(`${url}pokemons/${name}`);
}

function scan() {
	return axios.get(`${url}pokemons/`);
}

function chunkArray(array, chunkSize) {
	return Array.from(
		{ length: Math.ceil(array.length / chunkSize) },
		(_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize),
	);
}

async function ping() {
	const pokemons = [
		"Bulbasaur",
		"Spearow",
		"Nidorino",
		"Zubat",
		"Dugtrio",
		"Fearow",
		"Charizard",
		"Ditto",
		"Mew",
		"Squirtle",
		"Pikachu",
		"Wooper",
		"Arbock",
		"Riachu",
		"Sandslash",
	];

	const requests = ["search", "scan", "get"]
		.flatMap((el) => Array(random(15, 25)).fill(el))
		.sort(() => Math.random() - 0.5);

	for (let req of requests) {
		try {
			if (req === "search") {
				await search(pokemons[random(0, pokemons.length - 1)]).catch(e => console.log(e));
			}
			if (req === "get") {
				await get(pokemons[random(0, pokemons.length - 1)]).catch(e => console.log(e));
			}
			if (req === "scan") {
				await scan().catch(e => console.log(e));
			}
		} catch (e) {
			console.log(e);
		}

		await wait(1000);
	}
	await sns
		.publish({ TopicArn: process.env.TOPIC_ARN, Message: "wow much payload" })
		.promise();
}

exports.ping = ping;
