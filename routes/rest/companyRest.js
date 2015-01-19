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
		// res.status(401).json({ code: 2, msg: "" });
	}
	else next();
});

router.param("id", function(req, res, next, id) {

	if(!resolver.isNumber(id)) {

		next(resolver.handleError(null, 400, "Invalid company id."));
		// res.status(400).json({ code: 1, msg: "Invalid id." });
	}
	else {

		next();
	}
});

router.param("pid", function(req, res, next, pid) {

	if(!resolver.isNumber(id)) {

		next(resolver.handleError(null, 400, "Invalid project id."));
		// res.status(400).json({ code: 1, msg: "Invalid id." });
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
			// res.status(500).json({ code: 9, msg: "Internal error." });
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
				// res.status(404).json({ code: 3, msg:  });
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
						href: "/rest/project/" + project.projectId
					}
				});

				res.status(200).json(result);
			}
			else {

				next(resolver.handleError(null, 404, "Can't find company " + id + "."));
				// res.status(404).json({ code: 3, msg: "Can't find company " + id + "." });
			}
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
			// res.status(500).json({ code: 9, msg: "Internal error." });
		});
});

router.use(require("body-parser").json());

// insert a company
router.post("/", function(req, res, next) {

	var body = req.body;

	CompanyController.addCompany(body)
		.then(function() {

			res.status(200).end();
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

	CompanyController.addProject(id, body)
		.then(function(newCompany) {

			res.status(200).json({ new: newCompany });
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.put("/:id", function(req, res, next) {


});

// replace projects array with a new array
router.put("/:id/projects/", function(req, res, next) {


});

router.patch("/:id", function() {


});

router.patch("/:id/projects/:pid", function(req, res, next) {

	// filter the key start with $
});

router.delete("/:id", function(req, res, next) {


});

router.delete("/:id/projects/:pid", function(req, res, next) {


});

router.delete("/", function(req, res, next) {


});

router.use(function(req, res) {

	res.redirect("/rest/company/help");
});

module.exports = router;
