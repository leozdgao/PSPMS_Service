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

		res.status(401).json({ code: 2, msg: "UnAuthorized." });
	}
	else next();
});

router.param("id", function(req, res, next, id) {

	if(!resolver.isNumber(id)) {

		res.status(400).json({ code: 1, msg: "Invalid id." });
	}
	else {

		next();
	}
});

router.get("/", function(req, res) {

	var query = resolver.resolveObject(req.query);

	CompanyController.getCompanies(query.conditions, query.fields, query.options, req.isAdmin)
		.then(function(companies) {

			res.status(200).json({ code: 0, results: companies });
		})
		.catch(function(err) {

			res.status(500).json({ code: 9, msg: "Internal error." });
		});
});

router.get("/:id", function(req, res) {

	var query = resolver.resolveObject(req.query);
	var id = req.params.id;

	CompanyController.getCompanyById(id, query.fields, query.options, req.isAdmin)
		.then(function(company) {

			if(resolver.isDefined(company)) {

				res.status(200).json({ code: 0, results: company });
			}
			else {

				res.status(404).json({ code: 3, msg: "Can't find company " + id + "." });
			}
		})
		.catch(function(err) {

			res.status(500).json({ code: 9, msg: "Internal error during get company " + id + "." });
		});
});

router.get("/:id/projects", function(req, res) {

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

				res.status(200).json({ code: 0, results: result });
			}
			else {

				res.status(404).json({ code: 3, msg: "Can't find company " + id + "." });
			}
		})
		.catch(function() {

			res.status(500).json({ code: 9, msg: "Internal error." });
		});
});

router.use(require("body-parser").json());

router.use(function(req, res) {

	res.redirect("/rest/company/help");
});

module.exports = router;
