const axios = require("axios");
const util = require("util");

const wait = util.promisify(setTimeout);

async function ping() {
  const pokemons = ["Bulbasaur", "Spearow", "Nidorino", "Zubat", "Dugtrio"];
  while (true) {
    const index = Math.floor(Math.random() * pokemons.length);
    const url = `${process.env.URL}/prod/pokemons/${pokemons[index]}`;
    try {
      console.log(`Calling with ${pokemons[index]}`);
      await axios(url);
    } catch(_) {
      // swallow the error
    }
    await wait(100 * index);
  }
}

ping();
