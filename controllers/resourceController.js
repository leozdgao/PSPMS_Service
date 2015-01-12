var RestController = require("restController");
var resolver = require("../helpers/resolve");
var resource = require("../data/model").Resource;

var ResourceController = new RestController(resource);

ResourceController.getResources = function(conditions, fields, options) {

	var conditions = conditions || {};
	conditions.enable = true;

	return this._query(conditions, fields, options);
}

ResourceController.removeResource = function(conditions, options) {

	return this._update(conditions, { $set: { enable: false, leaveDate: new Date() } }, options);
}

ResourceController.removeResourceById = function(id, options) {

	return this._update({ _id: id }, { $set: { enable: false, leaveDate: new Date() } }, options);
}

ResourceController.isValid = function(resource, checkRequired) {

	var valid = true;
	var isDefined = resolver.isDefined,
		isString = resolver.isString,
		isNumber = resolver.isNumber;
	var resource = resource || {};

	// check required fields in resource
	if(checkRequired) {

		if(!(isNumber(resource.resourceId) && isString(resource.name))) {

			valid = false;
		}
	}
	else {

		if(isDefined(resource.resourceId) && isNumber(resource.resourceId)) {

			valid = false;
		}

		if(isDefined(resource.name) && isString(resource.name)) {

			valid = false;
		}
	}

	if(isDefined(resource.enable))

	return valid;
}

module.exports = ResourceController;