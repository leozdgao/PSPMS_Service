var Promise = require("bluebird");

var ProjectModel = require("../models/model").Project;
var CompanyModel = require("../models/model").Company;
var JobModel = require("../models/model").Job;
var TrunkModel = require("../models/model").Trunk;

var RestController = require("./restController");
var ProjectController = new RestController(ProjectModel);

var resolver = require("../helpers/resolve");

ProjectController.getProjects = function(conditions, fields, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._query(conditions, fields, options);
}

ProjectController.getProjectById = function(id, fields, options, isAdmin) {

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._findOne(conditions, fields, options);
}

ProjectController.getCompanyOfProject = function(id, fields, isAdmin) {

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this.model.findOne(conditions).populate('companyId', fields).execAsync();
}

ProjectController.getJobsOfProject = function(id, fields, isAdmin) {

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this.model.findOne(conditions).populate('jobs', fields).execAsync();
}

var last; // TODO add project to company
ProjectController.addProject = function(project) {

	var self = this, newProject;

	return new Promise(function(resolve, reject) {

		// auto increment projectId
		if(resolver.isUndefined(project.projectId)) {

			if(resolver.isUndefined(last)) {

				self._query({}, "projectId", { "sort": { "projectId": -1 } })
					.then(function(results) {
						
						var lastProject = results[0] || {};
						// set last companyId
						last = parseInt(lastProject.projectId);
						if(!isNaN(last)) project.projectId = last + 1;

						resolve(self._insert(project));
					})
					.catch(function(err) {

						reject(err);
					});	
			}
			else {

				project.projectId = last + 1;
				resolve(self._insert(project));
			}
		}
		else {

			resolve(self._insert(project));
		}
	})
	// add to company
	.then(function(results) {

		newProject = results[0];
		return CompanyModel.findOneAndUpdateAsync({ _id: newProject.companyId }, { '$push': { projects: newProject._id } });
	})
	.then(function() {

		return newProject;
	});
}

ProjectController.addJobForProject = function(id, body, isAdmin) {

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	var self = this;
	var jobResult;

	return new Promise(function(resolve, reject) {

		self._findOne(conditions)
			.then(function(project) {

				if(project != null) {

					body.projectId = project._id;
					var newJob = new JobModel(body);
					return newJob.saveAsync();
				}
				else reject('404');
			})
			.then(function(results) {

				if(results[0]) {

					jobResult = results[0]; console.log(jobResult._id);
					return self._updateOne(conditions, { '$push': { jobs : jobResult._id } });
				}
				else {
					reject(new Error('Update not effect'));
				}
			})
			.then(function() {

				resolve(jobResult);
			})
			.catch(function(err) {

				reject(err);
			});	
	});
}

ProjectController.updateProjectById = function(id, update, options, isAdmin) {

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._updateOne(conditions, update, options);
}

ProjectController.changeCompany = function(id, cid, isAdmin) {

	var conditions = { projectId: id }, self = this;
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return self._findOne(conditions)
		.then(function(project) {

			if(project != null && cid != project.companyId) {

				return Promise.all([
					self._updateOne(conditions, { companyId: cid }),
					CompanyModel.findOneAndUpdateAsync({ _id: cid }, { '$addToSet': { projects: project._id } }),
					CompanyModel.findOneAndUpdateAsync({ _id: project.companyId }, { '$pull': { projects: project._id } })
				]);
			}
		});
}

ProjectController.removeProjectById = function(id, options, isAdmin) {

	var conditions = { projectId: id }, self = this, oProject;

	return self._findOne(conditions)
		.then(function(project) {

			if(project != null) {

				oProject = project;
				var trunk = new TrunkModel();
				trunk.type = 'project';
				trunk.instance = project;

				return trunk.saveAsync();
			}
		})
		.then(function() {

			return self._removeOne(conditions);
		})
		// remove project in company
		.then(function() {

			if(oProject) {

				return CompanyModel.findOneAndUpdateAsync({ _id: oProject.companyId }, { '$pull': { projects: oProject._id } });	
			}
		});
}

module.exports = ProjectController;
