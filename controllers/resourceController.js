var RestController = require("./restController");
var resource = require("../models/model").Resource;

var ResourceController = new RestController(resource);

ResourceController.getResourceById = function(id, fields, options, isAdmin) {

	var conditions = { resourceId: id };
	if(!isAdmin) conditions.enable = true;

	return this._findOne({ resourceId: id, enable: true }, fields, options);
}

ResourceController.getResources = function(conditions, fields, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.enable = true;

	return this._query(conditions, fields, options);
}

ResourceController.addResource = function(resource) {

	return this._insert(resource);
}

ResourceController.updateResourceById = function(id, update, options) {

	return this._updateOne({ resourceId: id }, update, options);
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