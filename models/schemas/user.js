var Schema = require("mongoose").Schema;

module.exports = new Schema({
	name: { type: String },
	password: { type: String },
	salt: { type: String },
	role: { type: Number },
	resourceId: { type: Number }
},  { collection: "users", versionKey: false });