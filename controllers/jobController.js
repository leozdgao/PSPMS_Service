var Promise = require("bluebird");

var JobModel = require("../models/model").Job;
var ProjectModel = require("../models/model").Project;
var TrunkModel = require("../models/model").Trunk;

var RestController = require("./restController");
var JobController = new RestController(JobModel);

var resolver = require("../helpers/resolve");

JobController.getJobById = function(id, fields, options) {

	var conditions = { _id: id };

	return this._findOne(conditions, fields, options);
}

JobController.getJobs = function(conditions, fields, options) {

	return this._query(conditions, fields, options);
}

JobController.addJob = function(job) {

	var projectId = job.projectId;
	var tasks = [ this._insert(job) ];
	if(projectId) tasks.push(ProjectModel.findOneAndUpdateAsync({ _id: projectId }, { '$push': { jobs: jobId } }));

	return Promise.all(tasks);
}

JobController.updateJobById = function(id, update, options) {

	var conditions = { _id: id };

	return this._updateOne(conditions, update, options);
}

JobController.removeJobById = function(id) {

	var conditions = { _id: id }, self = this, projectId, jobId;

	return this._findOne(conditions)
		.then(function(job) {

			if(job !== null) {

				var trunk = new TrunkModel();
				trunk.type = 'job';
				trunk.instance = job;
				projectId = job.projectId;
				jobId = job._id;

				return trunk.saveAsync();
			}
		})
		.then(function() {

			var task = [self._removeOne(conditions)];
			if(projectId) task.push(ProjectModel.findOneAndUpdateAsync({ _id: projectId }, { '$pull': { jobs: jobId } }));
			return Promise.all(task);
		});
}

module.exports = JobController;