var express = require("express");
var router = express.Router();

var ProjectController = require("../../controllers/projectController");
var resolver = require("../../helpers/resolve");

router.use("/help", function (req, res) {

	res.status(200).json({
		availableApi: require("./helpers.json").project
	});
});

// auth
router.use(function (req, res, next) {

	// only leader can modify companies
	if(req.needAuth && req.method !== "GET" && !req.isLeader) {

		next(resolver.handleError(null, 401, "UnAuthorized."));
	}
	else next();
});

router.param("id", function (req, res, next, pid) {

	if(!resolver.isNumber(pid)) {

		next(resolver.handleError(null, 400, "Invalid project id."));
	}
	else {

		next();
	}
});

router.get("/", function (req, res, next) {

	var query = resolver.resolveObject(req.query);

	ProjectController.getProjects(query.conditions, query.fields, query.options, req.isAdmin)
		.then(function(projects) {

			res.status(200).json(projects);
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

router.get("/:id", function (req, res, next) {

	var query = resolver.resolveObject(req.query);
	var id = req.params.id;

	ProjectController.getProjectById(id, query.fields, query.options, req.isAdmin)
		.then(function(project) {

			if(resolver.isDefined(project)) {

				res.status(200).json(project);
			}
			else {

				next(resolver.handleError(null, 404, "Can't find project " + id + "."));
			}
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

// query company of project
router.get("/:id/company", function (req, res, next) {

	var query = resolver.resolveObject(req.query);
	var id = req.params.id;

	ProjectController.getCompanyOfProject(id, query.fields, req.isAdmin)
		.then(function(project) {

			if(resolver.isDefined(project)) {

				res.status(200).json(project.companyId || {});
			}
			else {

				next(resolver.handleError(null, 404, "Can't find project " + id + "."));
			}
		});
});

// query jobs of project //TODO
router.get("/:id/jobs", function (req, res, next) {

	var query = resolver.resolveObject(req.query);
	var id = req.params.id;

	ProjectController.getJobsOfProject(id, query.fields, req.isAdmin)
		.then(function(project) {

			if(resolver.isDefined(project)) {
				console.log(project);

				res.status(200).json(project.jobs || []);
			}
			else {

				next(resolver.handleError(null, 404, "Can't find project " + id + "."));
			}
		})
});

router.use(require("body-parser").json());

// add a project  //TODO
router.post("/", function (req, res, next) {

	var body = req.body;

	ProjectController.addProject(body)
		.then(function(results) {

			var result = results[0];
			res.status(200).json(result || {});
		})
		.catch(function(err) {

			var err = resolver.handleError(err);
			next(err);
		});
});

// add a job for a project
router.post("/:id/jobs", function (req, res, next) {

	var id = req.params.id;
	var body = req.body;

	ProjectController.addJobForProject(id, body, req.isAdmin)
		.then(function(job) {

			res.status(200).end();
		})
		.catch(function(err) {

			var error = err;

			if(err === '404') {

				error = resolver.handleError(null, 404, "Project not found.");
			}
			
			next(resolver.handleError(error));
		});
});

// update a project
router.put("/:id", function (req, res, next) {

	var id = req.params.id;
	var body = req.body;
	var options = body.options || {};
	options.runValidators = true;

	if(resolver.isUndefined(body.update)) {

		var error = resolver.handleError(null, 400, "Bad request");
		next(error);
	}
	else {

		ProjectController.updateProjectById(id, body.update, options, req.isAdmin)
			.then(function(newProject) {

				if(newProject != null) {

					res.status(200).json({ new: newProject});	
				}
				else {

					var error = resolver.handleError(null, 404, "Project not found.");
					next(error);
				}
			})
			.catch(function(err) {
				
				var error = resolver.handleError(err);
				next(error);
			});
	}
});

// update company of the project
router.put("/:id/company", function (req, res, next) {

	var id = req.params.id;
	var body = req.body;

	ProjectController.changeCompany(id, body.companyId, req.isAdmin)
		.then(function(newProject) {

			console.log(arguments);
			if(newProject != null) {

				res.status(200).json({ new: newProject});	
			}
			else {

				var error = resolver.handleError(null, 404, "Project not found.");
				next(error);
			}			
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		})
});

// remove a project
router.delete("/:id", function (req, res, next) {


});

// remove jobs of a project
router.delete("/:id/jobs", function (req, res, next) {


});

router.use(function(req, res) {

	res.redirect("/rest/company/help");
});

module.exports = router;