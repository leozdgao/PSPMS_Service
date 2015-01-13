var RestController = require("restController");
var resolver = require("../helpers/resolve");
var resource = require("../data/model").Resource;

var ResourceController = new RestController(resource);

ResourceController.getEnableResources = function(conditions, fields, options) {

	var conditions = conditions || {};
	conditions.enable = true;

	return this._query(conditions, fields, options);
}

ResourceController.getResourceById = function(id, fields, options) {

	return this._findOne({ resourceId: id }, fields, options);
}

ResourceController.getResources = function(conditions, fields, options) {

	return this._query(conditions, fields, options);
}

ResourceController.addResource = function(resource) {

	return this._insert(resource);
}

ResourceController.updateResource = function(conditions, update, options) {

	return this._update(conditions, update, options);
}

ResourceController.removeResource = function(conditions, options) {

	return this._update(conditions, { $set: { enable: false, leaveDate: new Date() } }, options);
}

ResourceController.removeResourceById = function(id, options) {

	return this._update({ resourceId: id }, { $set: { enable: false, leaveDate: new Date() } }, options);
}


module.exports = ResourceController;