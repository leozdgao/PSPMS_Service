var Promise = require("bluebird");
var RestController = require("./restController");
var project = require("../models/model").Project;
var job = require("../models/model").Job;

var CompanyController = require("./companyController");
// var JobController = require("./jobController");
var ProjectController = new RestController(project);

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

	var self = this;
	return new Promise(function(resolve, reject) {

		// auto increment companyId
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
					var newJob = new job(body);
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

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	var self = this;
	return new Promise(function(resolve, reject) {

		var tProject, tCompany;
		self._findOne(conditions)
			.then(function(project) {

				if(project != null) {

					tProject = project;
					return CompanyController.getCompanyById(cid, null, null, isAdmin);
				}
				else {

					reject('404');
				}
			})
			.then(function(company) {

				if(company != null) {

					tCompany = company;

					return Promise.all([
						self._updateOne(conditions, { companyId: tCompany._id }),
						CompanyController.updateCompanyById(cid, { '$push': { projects: tProject._id } }, null, isAdmin),
						CompanyController.updateCompany({ _id: tProject.companyId }, { '$pull': { projects: tProject._id } }, null, isAdmin)
					]); 
				}
				else {

					reject('404');
				}
			})
	});
	
}

ProjectController.removeProject = function(conditions, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.obsolete = { $ne: true };

	var options = options || { multi: true };

	return this._update(conditions, { $set: { obsolete: true } }, options);
}

module.exports = ProjectController;
