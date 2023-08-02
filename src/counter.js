require('./signing-workaround');
const db = require("./db");

exports.increment = function increment() {
	return db.update({
		TableName: "baselime-pokedex-prod-counter",
		Key: {
			id: "pokedex",
		},
		UpdateExpression: "SET #counter = #counter + :counter_inc",
		// For consistency, always use ExpressionAttributeNames for all attributes
		ExpressionAttributeNames: {
			"#counter": "count",
		},
		ExpressionAttributeValues: {
			":counter_inc": 1,
		},
		ReturnConsumedCapacity: "NONE",
		ReturnValues: "ALL_NEW",
	}).promise();
}
