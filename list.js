
'use strict';

const pokedex = require("./data/pokedex.json");
const numPerPage = 10;

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
  const page  = Number(event.queryStringParameters.page);
  console.log(JSON.stringify({ message: "REQUEST", extra: { event, page, requestId } }));
  try {

    if(page < 1) {
      const data = { message: "Bad Request" };
      console.log(JSON.stringify({ message: "RESPONSE", extra: { endpoint: "GET /", path: event.path, data, code: 400, requestId, page } }));
      return buildResponse(data , 400);
    }
    
    const pokemons = pokedex.slice((page - 1) * numPerPage, page * numPerPage);

    const data = { pokemons };
    console.log(JSON.stringify({ message: "RESPONSE", extra: { endpoint: "GET /", path: event.path, data, code: 200, requestId, page } }));
    return buildResponse(data, 200);
  } catch (error) {
    console.error(JSON.stringify({ message: "Unexpected error when getting a pokemon", extra: { error, code: 500, requestId, page } }));
    console.error(JSON.stringify({ message: "RESPONSE", extra: { endpoint: "GET /", path: event.path, code: 500, requestId, page } }));
    return buildResponse({ message: "Unexpected error" }, 500);
  }
};
