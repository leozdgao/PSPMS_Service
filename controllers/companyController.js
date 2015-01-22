var Promise = require("bluebird");
var RestController = require("./restController");
var company = require("../models/model").Company;

var ProjectController = require("./projectController");
var CompanyController = new RestController(company);

CompanyController.getCompanies = function(conditions, fields, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._query(conditions, fields, options);
}

CompanyController.getCompanyById = function(id, fields, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._findOne(conditions, fields, options);
}

CompanyController.getProjectIds = function(id, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._findOne(conditions, "projects", options);
}

CompanyController.addCompany = function(company) {

	return this._insert(company);
}

CompanyController.addProject = function(id, pid) {

	var self = this;
	return new Promise(function(resolve, reject) {

		var company;
		self._findOne({ companyId: id, obsolete: { $ne: true } }) // filter the obsolete company
			.then(function(result) {

				if(result != null) {
					// console.log("get company", result);
					company = result;
					//find project
					return ProjectController.getProjectById(pid, "name");
				}
				else reject("404");
			})
			.then(function(project) {
				// console.log("try get project", project);
				if(project != null) {

					company.projects.push({ projectId: pid, name: project.name });
					resolve(company.saveAsync());
				}
				else reject("404");
			})
			.catch(function(err) {

				reject(err);
			});
	});
}

CompanyController.updateCompanyById = function(id, update, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._updateOne(conditions, update, options);
}

CompanyController.updateCompany = function(conditions, update, options, isAdmin) {

	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._update(conditions, update, options);
}

CompanyController.updateCompanyProjects = function(id, projects, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	// replace projects array with a new array
	return this._update(conditions, { $set: { projects: projects } }, options);
}

CompanyController.updateProjectInCompany = function(cid, pid, update, options, isAdmin) {

	var conditions = { companyId: cid };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return new Promise(function(resolve, reject) {

		this._findOne(conditions)
			.then(function(company) {

				if(company != null) {

					var projects = company.projects || [];
					var project = projects.filter(function(item) {
						return item.projectId == pid;
					})[0];
					var index = projects.indexOf(project);

					if(index > -1) {

						// check validate
						company.projects[index] = update;
						resolve(company.saveAsync());
					}
					else reject("404");
				}
				else {

					reject("404");
				}
			})
			.catch(function(err) {

				reject(err);
			});
	});
}

CompanyController.removeCompany = function(conditions, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.obsolete = { $ne: true };

	var options = options || { multi: true };

	return this._update(conditions, { $set: { obsolete: true } }, options);
}

CompanyController.removeCompanyById = function(id, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._update(conditions, { $set: { obsolete: true } }, options);
}

CompanyController.removeProjectInCompany = function(cid, pid, options, isAdmin) {

	var conditions = { companyId: cid };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._update(conditions, { $pull: { projects: { projectId: pid } } }, options);
}

module.exports = CompanyController;
