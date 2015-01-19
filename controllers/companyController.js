var RestController = require("./restController");
var company = require("../models/model").Company;

var CompanyController = new RestController(company);

CompanyController.getCompanies = function(conditions, fields, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.obsolete = false;

	return this._query(conditions, fields, options);
}

CompanyController.getCompanyById = function(id, fields, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = false;

	return this._findOne(conditions, fields, options);
}

CompanyController.getProjectIds = function(id, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = false;

	return this._findOne(conditions, "projects", options);
}

CompanyController.addCompany = function(company) {

	return this._insert(company);
}

CompanyController.addProject = function(id, project) {

	return this._updateOne({ companyId: id }, { $push: { projects: project } });
}

module.exports = CompanyController;
