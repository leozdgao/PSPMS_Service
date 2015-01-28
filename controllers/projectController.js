var Promise = require("bluebird");
var RestController = require("./restController");
var project = require("../models/model").Project;

var CompanyController = require("./companyController");
var ProjectController = new RestController(project);

ProjectController.getProjectById = function(id, fields, options, isAdmin) {

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._findOne(conditions, fields, options);
}

ProjectController.updateProjectById = function(id, update, options, isAdmin) {

	var conditions = { projectId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._updateOne(conditions, update, options);
}

ProjectController.removeProject = function(conditions, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.obsolete = { $ne: true };

	var options = options || { multi: true };

	return this._update(conditions, { $set: { obsolete: true } }, options);
}

module.exports = ProjectController;
