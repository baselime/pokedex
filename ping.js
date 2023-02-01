const axios = require("axios");
const util = require("util");

const wait = util.promisify(setTimeout);
const url = 'https://a43hiiwt6d.execute-api.eu-west-1.amazonaws.com/prod/'

function random(min, max) {
  return Math.ceil(Math.random() * (max- min) + min)
}
function search(term) {
  return axios.get(`${url}search?term${term}`)
}

function get(name) {
  return axios.get(`${url}pokemons/${name}`)
}

function scan() {
  return axios.get(`${url}pokemons/`)
}

function chunkArray(array, chunkSize) {
  return Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)   
  );
}

async function ping() {
  const pokemons = ["Bulbasaur", "Spearow", "Nidorino", "Zubat", "Dugtrio"];

  const promises = ['search', 'scan', 'get'].flatMap((el => Array(random(10, 100)).fill(el))).sort(() => Math.random() - 0.5)
  console.log()

  for(let reqs of chunkArray(promises, 3)) {
    try {
      const res = await Promise.all(reqs.map((el) => {
        if(el === 'search') {
          return search(pokemons[random(0, pokemons.length)])
        }
        if(el === 'get') {
          return get(pokemons[random(0, pokemons.length)])
        }
        if(el === 'scan') {
          return scan()
        }
      }))
      console.log(res.map(el => el.data))
    } catch(e) {
      console.log(e)
    }
    

    await wait(50)
  }
}

module.exports = ping
