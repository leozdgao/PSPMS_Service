var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

var projectInCompanySchema = new Schema({
	projectId: { type: Number, required: true },
	name: { type: String, required: true }
}, { _id: false, versionKey: false });

var companySchema = new Schema({
	companyId: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	clientId: { type: String, unique: true },
	serverFolder: { type: String },
	perforceFolder: { type: String },
	projects: { type: [projectInCompanySchema] },
	// projects: { type: [Number] },
	obsolete: { type: Boolean, default: false }
}, { collection: "companies", versionKey: false });



module.exports = companySchema;