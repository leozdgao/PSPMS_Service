var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

var resourceSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, auto: true },
	resourceId: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	avatar: { type: String },
	joinDate: { type: Date, default: new Date() },
	leaveDate: { type: Date },
	email: { type: String },
	isIntern: { type: Boolean, default: false },
	account: {
		uid: { type: String },
		pwd: { type: String },
		salt: { type: String },
		role: { type: Number },
		lastLoginDate: { type: Date }
	}
}, { collection: "resources", versionKey: false });

module.exports = resourceSchema;
