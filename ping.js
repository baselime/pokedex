
const util = require("util");
const SNS = require('aws-sdk/clients/sns')

const X = require('aws-xray-sdk');
const axios = require('axios')

const sns = X.captureAWSClient(new SNS())
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
	const pokemons = ["Bulbasaur", "Spearow", "Nidorino", "Zubat", "Dugtrio", "Fearow"];

	const promises = ["search", "scan", "get"]
		.flatMap((el) => Array(random(1, 15)).fill(el))
		.sort(() => Math.random() - 0.5);

	for (let reqs of chunkArray(promises, 3)) {
		try {
			const res = await Promise.all(
				reqs.map((el) => {
					if (el === "search") {
						return search(pokemons[random(0, pokemons.length - 1)]);
					}
					if (el === "get") {
						return get(pokemons[random(0, pokemons.length - 1)]);
					}
					if (el === "scan") {
						return scan();
					}
				}),
			);
		} catch (e) {
			console.log(e);
		}

		await wait(50);
	}
	await sns.publish({ TopicArn: process.env.TOPIC_ARN, Message: 'wow much payload' }).promise()
}

exports.ping = ping;