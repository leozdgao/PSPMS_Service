var Promise = require("bluebird");

var CompanyModel = require("../models/model").Company;
var TrunkModel = require("../models/model").Trunk;

var RestController = require("./restController");
var CompanyController = new RestController(CompanyModel);

var resolver = require("../helpers/resolve");

CompanyController.getCompanies = function(conditions, fields, options) {

	return this._query(conditions, fields, options);
}

CompanyController.getCompanyById = function(id, fields, options) {

	var conditions = { _id: id };

	return this._findOne(conditions, fields, options);
}

CompanyController.getProjectIds = function(id, options) {

	var conditions = { _id: id };

	return this.model.findOne(conditions)
		.populate('projects', 'projectId name startDate lastUpdateDate status').execAsync();
}

var last;
CompanyController.addCompany = function(company) {

	var self = this;
	return new Promise(function(resolve, reject) {

		// auto increment companyId
		if(resolver.isUndefined(company.companyId)) {

			if(resolver.isUndefined(last)) {

				self._query({}, "companyId", { "sort": { "companyId": -1 } })
					.then(function(results) {

						var lastCompany = results[0] || {};
						// set last companyId
						last = parseInt(lastCompany.companyId);
						if(!isNaN(last)) company.companyId = ++last;

						resolve(self._insert(company));
					})
					.catch(function(err) {

						reject(err);
					});
			}
			else {

				company.companyId = ++last;
				resolve(self._insert(company));
			}
		}
		else {

			resolve(self._insert(company));
		}
	});
}

CompanyController.updateCompanyById = function(id, update, options) {

	var conditions = { companyId: id };

	return this._updateOne(conditions, update, options);
}

CompanyController.updateCompany = function(conditions, update, options) {

	return this._update(conditions, update, options);
}

CompanyController.removeCompanyById = function(id, options) {

	var conditions = { companyId: id }, self = this;

	return self._findOne(conditions)
		.then(function(company) {

			if(company != null) {

				var trunk = new TrunkModel();
				trunk.type = 'company';
				trunk.instance = company;

				return trunk.saveAsync();
			}
		})
		.then(function() {

			return self._removeOne(conditions);
		});
}

module.exports = CompanyController;
