var Promise = require("bluebird");

var ProjectModel = require("../models/model").Project;
var CompanyModel = require("../models/model").Company;
var TrunkModel = require("../models/model").Trunk;

var RestController = require("./restController");
var ProjectController = new RestController(ProjectModel);

var resolver = require("../helpers/resolve");

ProjectController.getProjects = function(conditions, fields, options) {

	return this._query(conditions, fields, options);
}

ProjectController.getProjectById = function(id, fields, options) {

	var conditions = { projectId: id };

	return this._findOne(conditions, fields, options);
}

ProjectController.getCompanyOfProject = function(id, fields) {

	var conditions = { projectId: id };

	return this.model.findOne(conditions).populate('companyId', fields).execAsync();
}

ProjectController.getJobsOfProject = function(id, fields) {

	var conditions = { projectId: id };

	return this.model.findOne(conditions).populate('jobs', fields).execAsync();
}

var last;
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
						if(!isNaN(last)) project.projectId = ++last;

						resolve(self._insert(project));
					})
					.catch(function(err) {

						reject(err);
					});	
			}
			else {

				project.projectId = ++last;
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
	.then(function(result) {

		return [newProject, result];
	});
}

ProjectController.updateProjectById = function(id, update, options) {

	var conditions = { projectId: id };

	return this._updateOne(conditions, update, options);
}

ProjectController.changeCompany = function(id, cid) {

	var conditions = { projectId: id }, self = this;

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

ProjectController.removeProjectById = function(id, options) {

	var conditions = { projectId: id }, self = this, oProject, tempP;

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
		.then(function(result) {
			tempP = result;
			if(oProject) {

				return CompanyModel.findOneAndUpdateAsync({ _id: oProject.companyId }, { '$pull': { projects: oProject._id } });	
			}
		})
		.then(function(result) {
			return [result, tempP];
		});
}

module.exports = ProjectController;
