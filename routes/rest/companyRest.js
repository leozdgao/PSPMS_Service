var express = require('express');
var router = express.Router();

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

	var query = resolver.resolveObject(req.query);

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

	var query = resolver.resolveObject(req.query);
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

	var query = resolver.resolveObject(req.query);
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

// push a project to a company
router.post("/:id/projects", function(req, res, next) {

	var body = req.body;
	var id = req.params.id;

	CompanyController.addProject(id, body.projectId)
		.then(function() {

			res.status(200).end();
		})
		.catch(function(err) {

			console.log(err);
			var error;
			if(err === "404") {

				error = resolver.handleError(null, 404, "Company or project Not found.");
			}
			else if(err === 'dup') {

				error = resolver.handleError(null, 400, "Project is already existed in this company.");
			}
			else {

				error = resolver.handleError(err);
			}
			
			next(error);
		});
});

router.put("/:id", function(req, res, next) {

	// filter the key start with $
	var id = req.params.id;
	var body = req.body;
	var options = body.options || {};
	options.runValidators = true;

	CompanyController.updateCompanyById(id, body.update, options, req.isAdmin)
		.then(function(newCompany) {

			res.status(200).json({ new: newCompany });
		})
		.catch(function(err) {
			console.log(err);
			var error = resolver.handleError(err);
			next(error);
		});
});


// router.patch("/:id", function() {


// });

router.delete("/:id", function(req, res, next) {

	var id = req.params.id;
	var body = req.body;

	CompanyController.removeCompanyById(id, {}, req.isAdmin)
		.then(function(results) {

			var num = results[1] ? results[0] : 0;
			if(num > 0) {

				// sCache.remove(id);
				res.status(200).json({ numAffected: num });
			}
			else {

				next(resolver.handleError(null, 400, "Update not affected."));
			}
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.delete("/:id/projects/:pid", function(req, res, next) {

	var id = req.params.id;
	var pid = req.params.pid;
	var body = req.body;

	CompanyController.removeProjectInCompany(id, pid, body, req.isAdmin)
		.then(function(results) {

			var comUpdate = results[0];

			var num = comUpdate[1] ? comUpdate[0] : 0;
			
			if(num > 0) {

				// sCache.remove(id);
				res.status(200).json({ numAffected: num });
			}
			else {

				next(resolver.handleError(null, 400, "Update not affected."));
			}
		})
		.catch(function(err) {

			var error = err;

			if(err == '404') {

				error = resolver.handleError(null, 400, "Update not affected");
			}
			else error = resolver.handleError(err);

			next(error);
		});
});

// router.delete("/", function(req, res, next) {

// 	var body = req.body;

// 	CompanyController.removeCompany(body.conditions, body.options, req.isAdmin)
// 		.then(function(results) {

// 			var num = results[1] ? results[0] : 0;
// 			if(num > 0) {

// 				res.status(200).json({ numAffected: num });
// 			}
// 			else {

// 				next(resolver.handleError(null, 400, "Update not affected."));
// 			}
// 		})
// 		.catch(function(err) {

// 			var err = resolver.handleError(err);
// 			next(err);
// 		});
// });

router.use(function(req, res) {

	res.redirect("/rest/company/help");
});

module.exports = router;
