var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

var companySchema = new Schema({
	companyId: { type: Number, unique: true },
	name: { type: String },
	clientId: { type: String, unique: true },
	serverFolder: { type: String },
	perforceFolder: { type: String },
	projects: { type: [projectInCompanySchema] },
	// projects: { type: [Number] },
	obsolete: { type: Boolean, default: false }
}, { collection: "companies" });

var projectInCompanySchema = new Schema({
	projectId: { type: Number },
	name: { type: String }
}, { _id: false })

module.exports = companySchema;