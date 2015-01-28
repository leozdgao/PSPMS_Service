var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

// var projectInCompanySchema = new Schema({
// 	projectId: { type: Number, required: true, ref: "Project" },
// 	// name: { type: String, required: true }
// }, { _id: false, versionKey: false });

var companySchema = new Schema({
	_id: { type: Schema.Types.ObjectId },
	companyId: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	clientId: { type: String, required: true, unique: true },
	serverFolder: { type: String },
	perforceFolder: { type: String },
	projects: { type: [{ type: Schema.Types.ObjectId, unique: true, required: true, ref: "Project" }] },
	obsolete: { type: Boolean, default: false }
}, { collection: "companies", versionKey: false });

companySchema.path("clientId").validate(resolver.isValidClientId, "Invalid client id");

module.exports = companySchema;