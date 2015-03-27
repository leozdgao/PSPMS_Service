var Schema = require("mongoose").Schema;
var resolver = require("../../helpers/resolve");

var resourceInJobSchema = new Schema({
	resourceId: { type: Schema.Types.ObjectId, required: true, ref: "Resource" },
	name: { type: String },
	hour: { type: Number, default: 4 },
	role: { type: Number, default: 0 }  // dev or test
}, { _id: false, versionKey: false });

//
// job in role: 0 - dev, 1 - test
resourceInJobSchema.path("role").validate(function(role) {

	return role === 1 || role === 0;
}, "Available value for job role is 0 or 1.");

var jobSchema = new Schema({
	_id: { type: Schema.Types.ObjectId, auto: true },
	projectId: { type: Schema.Types.ObjectId, ref: "Project" },
	startDate: { type: Date, default: new Date() },
	endDate: { type: Date, default: new Date() },
	// startDate: { type: Number, default: Date.now() },
	// endDate: { type: Number, default: Date.now() },
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
	workers: { type: [resourceInJobSchema] },
}, { _id: false, versionKey: false });

//
// build status: 0 - Not Started, 1 - In Progress, 2 - Ready,
// 3 - Tested, 9 - Finished
jobSchema.path("status").validate(function(status) {
	return status === 0 || status === 1 || status === 2 || 
		status === 3 || status === 9;
}, "Available value for job status is 0, 1, 2, 3 or 9.");

jobSchema.path("build").validate(function(build) {
	// 2000-2039
	return /^v\\d\\.\\d\\.20[0-3]\\d\\.(1[0-2]|0[1-9])(0[1-9]|[12]\\d|3[01])$/.test(build.dllversion);
}, "Invalid dll version");

module.exports = jobSchema;