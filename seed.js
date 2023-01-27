const DynamoDb = require('aws-sdk/clients/dynamodb');
const fs = require('fs/promises');
const path = require('path');


async function seedDb() {
    const file = await fs.readFile(path.join(__dirname, './data/pokedex.json'))
    const pokedex = JSON.parse(file.toString());


    const db = new DynamoDb.DocumentClient({ region: 'eu-west-1'});
    for(let pokemon of pokedex) {
        await db.put({
            TableName: 'baselime-pokedex-prod',
            Item: {
                ...pokemon
            }
        }).promise();

    }
}

exports.handler = seedDb;