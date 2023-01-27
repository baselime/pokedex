
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
    const threshold = name === "Fearow" ? 1 : 0;
    if (rand < threshold) {
      console.error(JSON.stringify({ message: "Backend error", extra: { rand, path: event.path, requestId, name } }));
      throw new Error("Backend error");
    }

    const pokemon = pokedex.find(pokemon => pokemon.name.english.toLocaleLowerCase() === name.toLocaleLowerCase());

    if (!pokemon) {
      const data = { message: "Pokemon not found" };
      console.log(JSON.stringify({ message: "RESPONSE", extra: { endpoint: "GET /{name}", path: event.path, data, code: 404, requestId, name } }));
      return buildResponse(data, 404);
    }

    const data = { pokemon };
    console.log(JSON.stringify({ message: "RESPONSE", extra: { endpoint: "GET /{name}", path: event.path, data, code: 200, requestId, name } }));
    return buildResponse(data, 200);
  } catch (error) {
    console.error(JSON.stringify({ message: "Unexpected error when getting a pokemon", extra: { error, code: 500, requestId, name } }));
    console.error(JSON.stringify({ message: "RESPONSE", extra: { endpoint: "GET /{name}", path: event.path, code: 500, requestId, name } }));
    return buildResponse({ message: "Unexpected error" }, 500);
  }
};
