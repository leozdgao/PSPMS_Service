var Promise = require("bluebird");
var RestController = require("./restController");
var resource = require("../models/model").Resource;

var ResourceController = new RestController(resource);

var resolver = require("../helpers/resolve");

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

// last resourceId
var last;
ResourceController.addResource = function(resource) {

	var self = this;
	return new Promise(function(resolve, reject) {

		// auto increment companyId
		if(resolver.isUndefined(resource.resourceId)) {

			if(resolver.isUndefined(last)) {

				self._query({}, "resourceId", { "sort": { "resourceId": -1 } })
					.then(function(results) {
						
						var lastResource = results[0] || {};
						// set last companyId
						last = parseInt(lastResource.resourceId);
						if(!isNaN(last)) resource.resourceId = last + 1;

						resolve(self._insert(resource));
					})
					.catch(function(err) {

						reject(err);
					});	
			}
			else {

				resource.resourceId = last + 1;
				resolve(self._insert(resource));
			}
		}
		else {

			resolve(self._insert(resource));
		}
	});
}

ResourceController.updateResourceById = function(id, update, options, isAdmin) {

	var conditions = { resourceId: id };
	if(!isAdmin) conditions.enable = true;

	return this._updateOne(conditions, update, options);
}

ResourceController.updateResource = function(conditions, update, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.enable = true;

	return this._update(conditions, update, options);
}

ResourceController.removeResource = function(conditions, options, isAdmin) {

	var conditions = conditions || {};
	if(!isAdmin) conditions.enable = true;
	
	return this._update(conditions, { $set: { enable: false, leaveDate: new Date() } }, options);
}

ResourceController.removeResourceById = function(id, options, isAdmin) {

	var conditions = { resourceId: id };
	if(!isAdmin) conditions.enable = true;

	return this._update(conditions, { $set: { enable: false, leaveDate: new Date() } }, options);
}


module.exports = ResourceController;