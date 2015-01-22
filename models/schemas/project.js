var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

var resourceInJobSchema = new Schema({
	resourceId: { type: Number, required: true },
	name: { type: String },
	hour: { type: Number, default: 4 },
	role: { type: Number, default: 0 }  // dev or test
}, { _id: false, versionKey: false });

//
// job in role: 0 - dev, 1 - test
resourceInJobSchema.path("role").validate(function(role) {

	return role === 1 || role === 0;
}, "Available value for job role is 0 or 1.");

// var buildInJobSchema = new Schema({
// 	name: { type: String, required: true },
// 	dllversion: { type: String },
// 	filechanges: { type: String, default: "none" },
// 	configchanges: { type: String, default: "none" }
// });

//
// check dll version
// buildInJobSchema.path("dllversion").validate(function(dll) {
// 	// 2000-2039
// 	return /^v\\d\\.\\d\\.20[0-3]\\d\\.(1[0-2]|0[1-9])(0[1-9]|[12]\\d|3[01])$/.test(dll);
// }, "Invalid dll version");

var jobInProjectSchema = new Schema({
	startDate: { type: Date, default: new Date() },
	endDate: { type: Date, default: new Date() },
	status: { type: Number, default: 0 },
	description: { type: String, required: true },
	comment: { type: String },
	isBuild: { type: Boolean },
	build: {
		type: {
			name: { type: String, required: true },
			dllversion: { type: String },
			filechanges: { type: String, default: "none" },
			configchanges: { type: String, default: "none" }
		}
	},
	workers: { type: [resourceInJobSchema], required:true },
}, { _id: false, versionKey: false });

//
// build status: 0 - Not Started, 1 - In Progress, 2 - Ready,
// 3 - Tested, 9 - Finished
jobInProjectSchema.path("status").validate(function(status) {
	return status === 0 || status === 1 || status === 2 || 
		status === 3 || status === 9;
}, "Available value for job status is 0, 1, 2, 3 or 9.");

jobInProjectSchema.path("build").validate(function(build) {
	// 2000-2039
	return /^v\\d\\.\\d\\.20[0-3]\\d\\.(1[0-2]|0[1-9])(0[1-9]|[12]\\d|3[01])$/.test(build.dllversion);
}, "Invalid dll version");

var projectSchema = new Schema({
	projectId: { type: Number, required: true },
	name: { type: String, required: true },
	companyId: { type: Number },
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
	jobs: { type: [jobInProjectSchema] },
	obsolete: { type: Boolean, default: false }
}, { collection: "projects", versionKey: false });

module.exports = projectSchema;