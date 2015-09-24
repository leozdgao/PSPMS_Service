var express = require('express');
var router = express.Router();
var qs = require('qs');

var ResourceController = require("../../controllers/resourceController");
var resolver = require("../../helpers/resolve");

router.use("/help", function(req, res) {

	res.status(200).json({
		availableApi: require("./helpers.json").resource
	});
});

// auth first
router.use(function(req, res, next) {

	if(req.needAuth) {

		if(req.method !== "GET") {

			// modifying resource is only permitted to admin or leader
			if(req.isAdmin || req.isLeader) {

				next();
			}
			else {

				next(resolver.handleError(null, 401, "UnAuthorized."));
			}
		}
		else {

			// own users who logged in can view resources
			if(req.isAuth) {

				next();
			}
			else {

				next(resolver.handleError(null, 401, "UnAuthorized."));
			}
		}

	}
	else {

		next();
	}
});

router.param("id", function(req, res, next, id) {

	if(!resolver.isNumber(id)) {

		next(resolver.handleError(null, 400, "Invalid resource id."));
	}
	else {

		next();
	}
});

// get a single resource
router.get("/:id", function(req, res, next) {

	var id = req.params.id;
	var query = qs.parse(req.query);

	ResourceController.getResourceById(id, query.fields, query.options, req.isAdmin)
		.then(function(resource) {

			if(resolver.isDefined(resource)) {

				res.status(200).json(resource);
			}
			else {

				next(resolver.handleError(null, 404, "Can't find resource " + id + "."));
			}
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

// return list of resources
router.get("/", function(req, res, next) {

	var query = qs.parse(req.query);

	ResourceController.getResources(query.conditions, query.fields, query.options, req.isAdmin)
		.then(function(resources) {

			res.status(200).json(resources);
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

router.use(require("body-parser").json());

router.post("/", function(req, res, next) {

	var body = req.body;

	ResourceController.addResource(body)
		.then(function(results) {

			res.status(200).end();
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

// update part of resource
router.put("/:id", function(req, res, next) {

	var id = req.params.id;
	var body = req.body;
	var options = body.options || {};
	// options.runValidators = true;

	if(resolver.isUndefined(body.update)) {

		var error = resolver.handleError(null, 400, "Bad request");
		next(error);
	}
	else {

		ResourceController.updateResourceById(id, body.update, options)
			.then(function(newResource) {

				res.status(200).json({ new: newResource });
			})
			.catch(function(err) {console.log(err);

				var error = resolver.handleError(err);
				next(error);
			});
	}
});

router.delete("/:id", function(req, res, next) {

	var id = req.params.id;

	ResourceController.removeResourceById(id, {}, req.isAdmin)
		.then(function(results) {

			res.status(200).json();
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

router.use(function(req, res) {

	res.redirect("/rest/resource/help");
});

module.exports = router;
