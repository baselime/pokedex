const errors = require("./errors.json");
function random(min, max) {
	return Math.ceil(Math.random() * (max - min) + min);
}

module.exports = function errorMessage() {
    return errors[random(0, errors.length)]
}