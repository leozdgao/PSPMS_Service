var Schema = require("mongoose").Schema;

module.exports = new Schema({
	resourceId: { type: Number },
	name: { type: String },
	joinDate: { type: Date },
	leaveDate: { type: Date },
	email: { type: String },
	enable: { type: Boolean },
	isIntern: { type: Boolean }
});