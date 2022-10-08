const axios = require("axios");
const util = require("util");

const wait = util.promisify(setTimeout);

async function ping() {
  const pokemons = ["Bulbasaur", "Spearow", "Nidorino", "Zubat", "Dugtrio"];
  while (true) {
    const index = Math.floor(Math.random() * pokemons.length);
    const url = `https://ol8ofl8jfa.execute-api.eu-west-2.amazonaws.com/prod/pokemons/${pokemons[index]}`;
    try {
      const response = (await axios(url)).data;
      console.log(`Calling with ${pokemons[index]}`, response.pokemon.id);
    } catch(_) {
      console.log("Error")
      // swallow the error
    }
    await wait(100 * index);
  }
}

ping();
