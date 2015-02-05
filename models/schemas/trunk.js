var Schema = require("mongoose").Schema;

module.exports = new Schema({
	type: { type: String, required: true },
	instance: {}
}, { collection: "trunks", versionKey: false });