var Promise = require("bluebird");
var RestController = require("./restController");
var company = require("../models/model").Company;

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

CompanyController.addProject = function(id, project) {

	return this._updateOne({ companyId: id }, { $push: { projects: project } });
}

CompanyController.updateCompanyById = function(id, update, options) {

	return this._updateOne({ companyId: id }, update, options);
}

CompanyController.updateCompany = function(conditions, update, options) {

	return this._update(conditions, update, options);
}

CompanyController.updateCompanyProjects = function(id, projects, options) {

	// replace projects array with a new array
	return this._update({ companyId: id }, { $set: { projects: projects } }, options);
}

CompanyController.updateProjectInCompany = function(cid, pid, update, options) {

	return new Promise(function(resolve, reject) {

		this._findOne({ companyId: cid })
			.then(function(company) {

				if(company != null) {

					var projects = company.projects || [];
					var project = projects.filter(function(item) {
						return item.projectId == pid;
					})[0];
					var index = projects.indexOf(project);

					if(index > -1) {

						// var updateObj = { $set: {} };
						// var setKey = "projects." + index;
						// updateObj.$set[setKey] = update;
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

CompanyController.removeCompany = function(conditions, options) {

	return this._update(conditions, { $set: { obsolete: true } }, options);
}

CompanyController.removeCompanyById = function(id, options) {

	return this._update({ companyId: id }, { $set: { obsolete: true } }, options);
}

CompanyController.removeProjectInCompany = function(cid, pid, options) {

	return this._update({ companyId: cid }, { $pull: { projects: { projectId: pid } } }, options);
}

module.exports = CompanyController;
