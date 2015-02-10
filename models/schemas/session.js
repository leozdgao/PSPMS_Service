var Schema = require("mongoose").Schema;

module.exports = new Schema({
	token: { type: String },
	resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
	role: { type: Number },
	expire: { type: Number }
}, { collection: "sessions", versionKey: false });