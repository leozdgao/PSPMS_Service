var express = require('express');
var router = express.Router();
var qs = require('qs');

var CompanyController = require("../../controllers/companyController");
var resolver = require("../../helpers/resolve");

router.use("/help", function(req, res) {

	res.status(200).json({
		availableApi: require("./helpers.json").company
	});
});

// auth
router.use(function(req, res, next) {

	// only leader can modify companies
	if(req.needAuth && req.method !== "GET" && !req.isLeader) {

		next(resolver.handleError(null, 401, "UnAuthorized."));
	}
	else next();
});

router.param("id", function(req, res, next, id) {

	if(!resolver.isNumber(id)) {

		next(resolver.handleError(null, 400, "Invalid company id."));
	}
	else {

		next();
	}
});

router.param("pid", function(req, res, next, pid) {

	if(!resolver.isNumber(pid)) {

		next(resolver.handleError(null, 400, "Invalid project id."));
	}
	else {

		next();
	}
});

router.get("/", function(req, res, next) {

	var query = qs.parse(req.query);

	CompanyController.getCompanies(query.conditions, query.fields, query.options, req.isAdmin)
		.then(function(companies) {

			res.status(200).json(companies);
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.get("/:id", function(req, res, next) {

	var query = qs.parse(req.query);
	var id = req.params.id;

	CompanyController.getCompanyById(id, query.fields, query.options, req.isAdmin)
		.then(function(company) {

			if(resolver.isDefined(company)) {

				res.status(200).json(company);
			}
			else {

				next(resolver.handleError(null, 404, "Can't find company " + id + "."));
			}
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.get("/:id/projects", function(req, res, next) {

	var query = qs.parse(req.query);
	var id = req.params.id;

	CompanyController.getProjectIds(id, query.options, req.isAdmin)
		.then(function(results) {

			if(resolver.isDefined(results)) {

				var projects = results.projects || [];
				var result = projects.map(function(project) {
					return {
						project: project,
						href: "/rest/project/" + (project.projectId || "?")
					}
				});

				res.status(200).json(result);
			}
			else {

				next(resolver.handleError(null, 404, "Can't find company " + id + "."));
			}
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.use(require("body-parser").json());

// insert a company
router.post("/", function(req, res, next) {

	var body = req.body;

	CompanyController.addCompany(body)
		.then(function(results) {

			var result = results[0];
			res.status(200).json(result || {});
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.put("/:id", function(req, res, next) {

	// filter the key start with $
	var id = req.params.id;
	var body = req.body;
	var options = body.options || {};
	options.runValidators = true;

	if(resolver.isUndefined(body.update)) {

		var error = resolver.handleError(null, 400, "Bad request");
		next(error);
	}
	else {

		CompanyController.updateCompanyById(id, body.update, options, req.isAdmin)
			.then(function(newCompany) {

				res.status(200).json({ new: newCompany });
			})
			.catch(function(err) {
				console.log(err);
				var error = resolver.handleError(err);
				next(error);
			});
	}
});

router.delete("/:id", function(req, res, next) {

	var id = req.params.id;
	var body = req.body;

	CompanyController.removeCompanyById(id, {}, req.isAdmin)
		.then(function(results) {

			res.status(200).json(results);
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.use(function(req, res) {

	res.redirect("/rest/company/help");
});

module.exports = router;
