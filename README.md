# pokedex

A demo application to demonstrate Observability as Code (OaC).

## Intro

`pokedex` is a demo web application back-end, with a single endpoint `GET /pokemons`. It takes as path parameter the Englis name of a pokemon and returns more details about the pokemon.

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
