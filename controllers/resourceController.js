var Promise = require("bluebird");
var RestController = require("./restController");
var ResourceModel = require("../models/model").Resource;
var TrunkModel = require("../models/model").Trunk;

var ResourceController = new RestController(ResourceModel);

var resolver = require("../helpers/resolve");

ResourceController.getResourceById = function(id, fields, options) {

	var conditions = { resourceId: id };

	return this._findOne(conditions, fields, options);
}

ResourceController.getResources = function(conditions, fields, options) {

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
						if(!isNaN(last)) resource.resourceId = ++last;

						resolve(self._insert(resource));
					})
					.catch(function(err) {

						reject(err);
					});	
			}
			else {

				resource.resourceId = ++last;
				resolve(self._insert(resource));
			}
		}
		else {

			resolve(self._insert(resource));
		}
	});
}

ResourceController.updateResourceById = function(id, update, options) {

	var conditions = { resourceId: id };

	return this._updateOne(conditions, update, options);
}

ResourceController.removeResourceById = function(id, options) {

	var conditions = { resourceId: id }, self = this;

	return this._findOne(conditions)
		.then(function(resource) {

			if(resource != null) {

				var trunk = new TrunkModel();
				trunk.type = 'resource';
				trunk.instance = resource;

				return trunk.saveAsync();
			}
		})
		.then(function() {

			return self._removeOne(conditions);
		});
}


module.exports = ResourceController;