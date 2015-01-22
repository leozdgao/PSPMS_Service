var Promise = require("bluebird");
var RestController = require("./restController");
var project = require("../models/model").Project;

var CompanyController = require("./companyController");
var ProjectController = new RestController(project);

ProjectController.getProjectById = function(id, fields, options, isAdmin) {

	var conditions = { companyId: id };
	if(!isAdmin) conditions.obsolete = { $ne: true };

	return this._findOne(conditions, fields, options);
}

module.exports = ProjectController;
