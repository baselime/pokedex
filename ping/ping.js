const util = require("util");
const SNS = require("aws-sdk/clients/sns");

const axios = require("axios");
const sns = new SNS({ region: 'eu-west-1' });
const wait = util.promisify(setTimeout);
const url = "https://agu92nq6vf.execute-api.eu-west-1.amazonaws.com/prod/";

function random(min, max) {
	const rand = Math.ceil(Math.random() * (max - min) + min);
	return rand;
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
		"Charmander",
		"Jigglypuff",
		"Eevee",
		"Mewtwo",
		"Gyarados",
		"Meowth",
		"Jolteon",
		"Ivysaur",
		"Venusaur",
		"Onix",
		"Vaporeon",
		"Gengar",
		"Ditto",
		"Pidgeotto",
		"Charizard",
		"Butterfree",
		"Machamp",
		"Dragonite",
		"Golem",
		"Lapras",
		"Jynx",
		"Vileplume",
		"Rhydon",
		"Alakazam",
		"Hitmonchan",
		"Gyarados",
		"Jolteon",
		"Flareon",
		"Porygon",
		"Kabuto",
		"Snorlax",
		"Articuno",
		"Zapdos",
		"Moltres",
		"Dratini",
		"Mew",
		"Raichu",
		"Golem",
		"Diglett",
		"Primeape",
		"Dewgong",
		"Dugtrio",
		"Persian",
		"Kingler",
		"Haunter",
		"Abra",
	];

	const requests = ["search", "scan", "get", "vercel", "cloudflare"].sort(() => Math.random() - 0.5);
	console.log(requests)
	for (let req of requests) {
		try {
			if (req === "search") {
				const modifiedArray = [...Array(Math.ceil(pokemons.length / 8)).fill("Pikachu"), ...pokemons];
				await search(modifiedArray[random(0, pokemons.length - 1)]).catch((e) => { });
			}
			if (req === "get") {
				const modifiedArray = [...Array(Math.ceil(pokemons.length / 8)).fill("SpongeBob"), ...Array(Math.ceil(pokemons.length / 8)).fill("Bulbasaur"), ...pokemons];
				await get(modifiedArray[random(0, pokemons.length - 1)]).catch((e) => { });
			}
			if (req === "scan") {
				await scan().catch((e) => { });
			}
			if(req === "vercel") {
				await axios.get(`https://t3-app-rouge.vercel.app/api/trpc/post.getLatest`).catch((e) => { console.log(e)});
				await axios.get(`https://nodejs-serverless-function-express-bice-sigma.vercel.app/api/hello`).catch((e) => { console.log(e)});
			}
			if(req === "cloudflare") {
				if(Math.random() < (1/30)) { 
					const errors = [1,2,3,4,5,6,7,8,89,9,1,23,6,2,26,3,73,357,357,34,375,347,2,152];
					for(let e of errors) {
						await axios.get("https://cloudflare-demo.baselime.workers.dev?error=true")
					}
				}
				await axios.get("https://cloudflare-otel-playground.baselime.workers.dev/").catch(e => { console.log(e) })
				await axios.get("https://cloudflare-demo.baselime.workers.dev/").catch(e => { console.log(e) })
				await axios.get("https://cloudflare-demo.baselime.workers.dev/").catch(e => { console.log(e) })
				await axios.get("https://cloudflare-demo.baselime.workers.dev/").catch(e => { console.log(e) })
			}
		} catch (e) { console.log(e)}

		await wait(1000);
	}

	// const messages = [
	// 	`Pikachu's cheeks spark with electric energy.`,
	// 	`Charizard's flames light up the night sky.`,
	// 	`Eevee evolves into various powerful forms.`,
	// 	`Bulbasaur carries a plant bulb on its back.`,
	// 	`Jigglypuff sings a lullaby that causes sleep.`,
	// 	`Gyarados emerges from raging waters.`,
	// 	`Team Rocket's motto: "To protect the world from devastation."`,
	// 	`Mewtwo is a genetically engineered Pokémon.`,
	// 	`Snorlax dozes peacefully, blocking pathways.`,
	// 	`Ash Ketchum dreams of becoming a Pokémon Master.`,
	// 	`Meowth speaks in human language.`,
	// 	`Jolteon's fur crackles with electric charge.`,
	// 	`Squirtle's water cannons blast opponents away.`,
	// 	`Gengar hides in the shadows, causing mischief.`,
	// 	`Bulbasaur evolves into Ivysaur, then Venusaur.`,
	// 	`Onix is a massive, serpentine rock Pokémon.`,
	// 	`Vaporeon's body shimmers with water molecules.`,
	// 	`Ditto transforms into any Pokémon it sees.`,
	// 	`Pidgeotto soars gracefully through the sky.`,
	// 	`Eevee adapts to different environments and evolves.`,
	// ];

	// const rand = random(0, messages.length - 1, Math.round(messages.length / 2), 1);

// 	await sns
// 		.publish({
// 			TopicArn: process.env.TOPIC_ARN || "arn:aws:sns:eu-west-1:522104763258:poke-topic-prod",

// 			Message: JSON.stringify({
// 				to: "help@baselime.io",
// 				from: "ash@pokemon.com",
// 				message: messages[rand],
// 			}),
// 			MessageAttributes: {
// 				type: { DataType: "String", StringValue: "email.send" },
// 			},
// 		})
// 		.promise();
}

exports.ping = ping;
