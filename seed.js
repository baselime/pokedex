const db = require("./db");
const fs = require("fs/promises");
const path = require("path");

async function seedDb() {
	const file = await fs.readFile(path.join(__dirname, "./data/pokedex.json"));
	const pokedex = JSON.parse(file.toString());

	for (let pokemon of pokedex) {
		console.log({
			...pokemon,
			en: pokemon.name.english,
			jp: pokemon.name.japanese,
			ch: pokemon.name.chinese,
			fr: pokemon.name.french,
		});
		await db
			.put({
				TableName: "baselime-pokedex-prod",
				Item: {
					...pokemon,
                    game: 'pokemon',
					en: pokemon.name.english,
					jp: pokemon.name.japanese,
					ch: pokemon.name.chinese,
					fr: pokemon.name.french,
				},
			})
			.promise();
	}
}

exports.handler = seedDb;