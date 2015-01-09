var Schema = require("mongoose").Schema;

module.exports = new Schema({
	token: { type: String },
	name: { type: String },
	role: { type: Number },
	expire: { type: Number }
});