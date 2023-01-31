# pokedex

A demo application to demonstrate Observability as Code (OaC).

Deployed to `https://a43hiiwt6d.execute-api.eu-west-1.amazonaws.com/prod`
## Intro

`pokedex` is a demo web application back-end, with a single endpoint `GET /pokemons`. It takes as path parameter the name of a pokemon and returns more details about the pokemon. The language defaults to english but you can use other language using the ?lang= query parameter. The options are en, jp, ch, and fr.

You can also list pokemon using the `GET /pokemons` endpoint without a path parameter

Finally you can search pokemons using lyra search at `GET /search?term=`, can you find the cold starts? Warning: the cold starts are Icey 🧊

However, the application will throw errors occasionally, based on a random number. This is used to demonstrate how to investigate issues using OaC and Baselime.

## Install

```bash
npm ci
```

## Deploy

```bash
npm run deploy
```

## Simulate traffic

To simulate traffic on the service:

```bash
URL=https://<urk> node ping.js
```

## Dataset

Data for the pokedex from [here](https://github.com/fanzeyi/pokemon.json)
