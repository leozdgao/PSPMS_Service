var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

var resourceSchema = new Schema({
	resourceId: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	joinDate: { type: Date, default: new Date() },
	leaveDate: { type: Date },
	email: { type: String },
	enable: { type: Boolean, default: true },
	isIntern: { type: Boolean, default: false }
}, { collection: "resources", versionKey: false });

resourceSchema.path("leaveDate").validate(resolver.isLater, "Invalid leave date.");
resourceSchema.path("email").validate(resolver.isEmail, "Invalid email.");

module.exports = resourceSchema;