var express = require('express');
var router = express.Router();

var ResourceController = require("../../controllers/resourceController");
var resolver = require("../../helpers/resolve");

// var Cache = require("../../helpers/scalablecache");
// var sCache = new Cache(50);
// var bCache = new Cache(500);

// put enable resource in cache first
// prepareCache();

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
				// res.status(401).json({ code: 2, msg: "UnAuthorized." });
			}	
		}
		else {

			// own users who logged in can view resources
			if(req.isAuth) {

				next();
			}
			else {

				next(resolver.handleError(null, 401, "UnAuthorized."));
				// res.status(401).json({ code: 2, msg: "UnAuthorized." });
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
		// res.status(400).json({ code: 1, msg: "Invalid id." });
	}
	else {

		next();
	}
});

// get a single resource
router.get("/:id", function(req, res, next) {

	var id = req.params.id;
	// var force = !!req.get("X-noCache");
	var query = resolver.resolveObject(req.query);

	// if(!force && sCache.keys.indexOf(id) > -1) {

	// 	//get from cache
	// 	res.status(200).json({ code: 0, results: sCache.get(id) });
	// }
	// else {

		ResourceController.getResourceById(id, query.fields, query.options, req.isAdmin)
			.then(function(resource) {

				if(resolver.isDefined(resource)) {

					// sCache.set(id, resource);
					res.status(200).json(resource);
				}
				else {

					next(resolver.handleError(null, 404, "Can't find resource " + id + "."));
					// res.status(404).json({ code: 3, msg: "Can't find resource " + id + "." });
				}
			})
			.catch(function(err) {

				var error = resolver.handleError(err);
				next(error);
			});
	// }
});

// return list of resources
router.get("/", function(req, res, next) {

	// var force = !!req.get("X-noCache");
	var query = resolver.resolveObject(req.query);

	// var cacheKey = JSON.stringify(query);

	// if(!force && bCache.keys.indexOf(cacheKey) > -1) {

	// 	//get cache
	// 	res.status(200).json({ code: 0, results: bCache.get(cacheKey) });
	// }
	// else {

		ResourceController.getResources(query.conditions, query.fields, query.options, req.isAdmin)
			.then(function(resources) {

				// bCache.set(cacheKey, resources);
				res.status(200).json(resources);
			})
			.catch(function(err) {

				var error = resolver.handleError(err);
				next(error);
			});
	// }
});

router.use(require("body-parser").json());

router.post("/", function(req, res, next) {

	var body = req.body;

	ResourceController.addResource(body)
		.then(function(results) {

			// clear cache for changing
			// bCache.clear();
			res.status(200).end();			
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

// replace resource with new obj
router.put("/:id", function(req, res, next) {

	var body = req.body;
	var id = req.params.id;
	var options = body.options || {};
	options.runValidators = true;
	options.overwrite = true;
	options.setDefaultsOnInsert = true;

	// key of body.update can't start with '$'
	if(body.update && Object.keys(body.update).every(function(key) { return !/^\$/.test(key); })
		// check requried
		&& resolver.isDefined(body.update.name) && resolver.isDefined(body.update.resourceId)) {

		// set default
		body.update.joinDate || (body.update.joinDate = new Date());
		body.update.enable || (body.update.enable = true);
		body.update.isIntern || (body.update.isIntern = false);

		ResourceController.updateResource({ resourceId: id }, body.update, options, req.isAdmin)
			.then(function(results) {

				var num = results[1] ? results[0] : 0;
				if(num > 0) {

					// sCache.remove(id);
					res.status(200).end();
				}
				else {

					next(resolver.handleError(null, 400, "Update not affected."));
					// res.status(400).json({ code: 4, msg: "Update not affected." });
				}
			})
			.catch(function(err) {

				var error = resolver.handleError(err);
				next(error);
			});	
	}
	else {

		next(resolver.handleError(null, 400, "Invalid request"));
		// res.status(400).json({ code: 1, msg: "Invalid request." });
	}
});

// update part of resource
router.patch("/:id", function(req, res, next) {

	var id = req.params.id;
	var body = req.body;
	var options = body.options || {};
	options.runValidators = true;

	ResourceController.updateResourceById(id, body.update, options, req.isAdmin)
		.then(function(newResource) {

			// update cache
			// sCache.set(id, newResource);
			res.status(200).json({ new: newResource });
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

router.delete("/:id", function(req, res, next) {

	var id = req.params.id;

	ResourceController.removeResourceById(id, {}, req.isAdmin)
		.then(function(results) {

			var num = results[1] ? results[0] : 0;
			if(num > 0) {

				// sCache.remove(id);
				res.status(200).json({ numAffected: num });
			}
			else {

				next(resolver.handleError(null, 400, "Update not affected."));
				// res.status(400).json({ code: 4, msg: "Update not affected." });
			}
		})
		.catch(function(err) {

			var error = resolver.handleError(err);
			next(error);
		});
});

router.delete("/", function(req, res, next) {

	var body = req.body;

	ResourceController.removeResource(body.conditions, { multi: true }, req.isAdmin)
		.then(function(results) {

			var num = results[1] ? results[0] : 0;
			if(num > 0) {

				// clear cache for changing
				// bCache.clear();
				res.status(200).json({ numAffected: num });
			}
			else {

				next(resolver.handleError(null, 400, "Update not affected."));
				// res.status(400).json({ code: 4, msg: "Update not affected." });
			}
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

// function prepareCache() {

// 	ResourceController.getEnableResources()
// 		.then(function(results) {

// 			results.forEach(function(resource) {

// 				sCache.set(resource.resourceId, resource);
// 			});
// 		})
// 		.catch(function(err) {

// 			console.log("Prepare cache failed. ", err);
// 		});	

// 	// ResourceController.... TODO
// }