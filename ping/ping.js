const util = require("util");
const SNS = require("aws-sdk/clients/sns");

const axios = require("axios");
const sns = new SNS({ region: 'eu-west-1' });
const wait = util.promisify(setTimeout);
const url = "https://sfmcfkwy9l.execute-api.eu-west-1.amazonaws.com/prod/";

function random(min, max) {
	return Math.ceil(Math.random() * (max - min) + min);
}
function search(term) {
	return axios.get(`${url}search?term=${term}`);
}

function get(name) {
	return axios.get(`${url}pokemon/${name}`);
}

function scan() {
	return axios.get(`${url}pokemon/`);
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
		"Pikachuuuu",
		"SpongeBob",
		"tom-and-jerry",
		"Popeye",
		"Wooper",
		"Sandslash",
	];

	const requests = ["search", "scan", "get"].flatMap((el) => Array(random(1, 15)).fill(el)).sort(() => Math.random() - 0.5);

	for (let req of requests) {
		try {
			if (req === "search") {
				await search(pokemons[random(0, pokemons.length - 1)]).catch((e) => {});
			}
			if (req === "get") {
				await get(pokemons[random(0, pokemons.length - 1)]).catch((e) => {});
			}
			if (req === "scan") {
				await scan().catch((e) => {});
			}
		} catch (e) {}

		await wait(1000);
	}
	await sns
		.publish({
			TopicArn: process.env.TOPIC_ARN || "arn:aws:sns:eu-west-1:522104763258:poke-topic-prod",
			
			Message: JSON.stringify({
				to: "help@baselime.io",
				from: "ash@pokemon.com",
				message: "Did you steal my Pikachu",
			}),
			MessageAttributes: {
				type: { DataType: "String", StringValue: "email.send" },
			},
		})
		.promise();
}

exports.ping = ping;
