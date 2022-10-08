
'use strict';

const pokedex = require("./data/pokedex.json");

function buildResponse(data, code) {
  return {
    statusCode: code,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(data),
  }
}

module.exports.handler = async (event, context) => {
  const requestId = context.awsRequestId;
  const { name } = event.pathParameters;
  console.log(JSON.stringify({ message: "REQUEST", extra: { event, name, requestId } }));
  try {

    const rand = Math.random();
    const threshold = name === "Bulbasaur" ? 0.5 : 0.1;
    if (rand < threshold) {
      console.log(JSON.stringify({ message: "Backend error", extra: { rand, requestId, name } }));
      throw new Error("Backend error");
    }

    const pokemon = pokedex.find(pokemon => pokemon.name.english.toLocaleLowerCase() === name.toLocaleLowerCase());

    if (!pokemon) {
      const data = { message: "Pokemon not found" };
      console.log(JSON.stringify({ message: "RESPONSE", extra: { data, code: 404, requestId } }));
      return buildResponse(data, 404);
    }

    const data = { pokemon };
    console.log(JSON.stringify({ message: "RESPONSE", extra: { data, code: 200, requestId } }));
    return buildResponse(data, 200);
  } catch (error) {
    console.log(JSON.stringify({ message: "Unexpected error when getting a pokemon", extra: { error, code: 500, requestId } }));
    console.log(JSON.stringify({ message: "RESPONSE", extra: { name, code: 500, requestId } }));
    return buildResponse({ message: "Unexpected error" }, 500);
  }
};
