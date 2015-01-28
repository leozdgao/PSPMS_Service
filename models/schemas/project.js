var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

var projectSchema = new Schema({
	_id: { type: Schema.Types.ObjectId },
	projectId: { type: Number, required: true },
	name: { type: String, required: true },
	companyId: { type: Schema.Types.ObjectId, ref: "Company" },
	assemblyName: { type: Number },
	startDate: { type: Date, default: new Date() },
	lastUpdateDate: { type: Date, default: new Date() },
	status: { type: Number, default: 0 },
	description: { type: String },
	sourceCode: { type: String },
	serverFolder: { type: String },
	perforceFolder: { type: String },
	isPlugin: { type: Boolean, default: false },
	isCodeBase: { type: Boolean, default: false },
	isUtility: { type: Boolean, default: false },
	isPAPI: { type: Boolean, default: false },
	isWebService: { type: Boolean, default: false },
	isProduct: { type: Boolean, default: false },
	jobs: { type: [{ type: Schema.Types.ObjectId }], ref: "Job" },
	obsolete: { type: Boolean, default: false }
}, { collection: "projects", versionKey: false });

module.exports = projectSchema;