var express = require('express');
var router = express.Router();
var qs = require('qs');

var JobController = require("../../controllers/jobController");
var resolver = require("../../helpers/resolve");

router.use("/help", function(req, res) {

	res.status(200).json({
		availableApi: require("./helpers.json").job
	});
});

// auth
router.use(function(req, res, next) {

	// only leader can modify companies
	if(req.needAuth && !req.isAuth) {

		next(resolver.handleError(null, 401, "UnAuthorized."));
	}

	else next();
});

router.get('/', function(req, res, next) {

	// var query = resolver.resolveObject(req.query);
	var query = req.query; console.log(query);

	JobController.getJobs(query.conditions, query.fields, query.options)
		.then(function(jobs) {

			res.status(200).json(jobs);
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

router.get('/:id', function(req, res, next) {

	var id = req.params.id;
	var query = qs.parse(req.query, { allowDots: true });

	JobController.getJobById(id, query.fields, query.options)
		.then(function(job) {

			if(resolver.isDefined(job)) {

				res.status(200).json(job);
			}
			else {

				next(resolver.handleError(null, 404, "Can't find job " + id + "."));
			}
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

router.use(require("body-parser").json());

// only leader can add job
router.post('/', function(req, res, next) {

	if(!req.isLeader) {

		next(resolver.handleError(null, 401, "UnAuthorized."));
	}
	else {

		var body = req.body;
		if(!body.projectId) {

			JobController.addJob(body)
				.then(function(results) {

					res.status(200).json({ new: results[0] });
				})
				.catch(function(err) {

					var error = resolver.handleError(err);
					next(error);
				});
		}
		else {

			next(resolver.handleError(null, 400, "ProjectID is required."));
		}
	}
});

// member can only modify their own jobs
router.put('/:id', function(req, res, next) {

	var id = req.params.id;
	var body = req.body;
	var options = body.options || {};
	options.runValidators = true;

	if(resolver.isUndefined(body.update)) {

		var error = resolver.handleError(null, 400, "Bad request");
		next(error);
	}
	else {

		if(req.needAuth && !req.isLeader) {

			JobController.getJobById(id)
				.then(function(job) {

					if(job != null &&
					 job.workers.some(function(val) { return val.resourceId == req.session.resource; })) {

						return JobController.updateJobById(id, body.update, options, req.isAdmin)

					}
					else throw new Error("Can't find job " + id + ".")
				})
				.then(function(newResource) {

					res.status(200).json({ new: newResource });
				})
				.catch(function(err) {

					var error = resolver.handleError(err);
					next(error);
				});
		}
		else {

			JobController.updateJobById(id, body.update, options, req.isAdmin)
				.then(function(newResource) {

					res.status(200).json({ new: newResource });
				})
				.catch(function(err) {

					var error = resolver.handleError(err);
					next(error);
				});
		}
	}
});

// only leader can remove job
router.delete('/:id', function(req, res, next) {

	if(req.needAuth && !req.isLeader) {

		next(resolver.handleError(null, 401, "UnAuthorized."));
	}
	else {

		var id = req.params.id;

		JobController.removeJobById(id)
			.then(function(results) {

				res.status(200).end();
			})
			.catch(function(err) {

				var error = resolver.handleError(err);
				next(error);
			});
	}
});

router.use(function(req, res) {

	res.redirect("/rest/job/help");
});

module.exports = router;
