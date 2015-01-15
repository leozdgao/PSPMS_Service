var express = require('express');
var router = express.Router();

var ResourceController = require("../../controllers/resourceController");
var resolver = require("../../helpers/resolve");

var Cache = require("../../helpers/scalablecache");
var sCache = new Cache(50);
var bCache = new Cache(500);

// put enable resource in cache first
prepareCache();

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

				res.status(401).json({ code: 2, msg: "UnAuthorized." });
			}	
		}
		else {

			// own users who logged in can view resources
			if(req.isAuth) {

				next();
			}
			else {

				res.status(401).json({ code: 2, msg: "UnAuthorized." });
			}
		}
		
	}
	else {
		
		next();
	}
});

router.use(require("body-parser").json());

router.param("id", function(req, res, next, id) {

	if(!resolver.isNumber(id)) {

		res.status(400).json({ code: 1, msg: "Invalid id." });
	}
	else {

		next();
	}
});

// get a single resource
router.get("/:id", function(req, res) {

	var id = req.params.id;
	var force = !!req.get("X-noCache");
	var query = resolver.resolveObject(req.query);

	if(!force && sCache.keys.indexOf(id) > -1) {

		//get from cache
		res.status(200).json({ code: 0, results: sCache.get(id) });
	}
	else {

		ResourceController.getResourceById(id, query.fields, query.options)
			.then(function(resource) {

				if(resolver.isDefined(resource)) {

					sCache.set(id, resource);
					res.status(200).json({ code: 0, results: resource });
				}
				else {

					res.status(404).json({ code: 3, msg: "Can't find resource " + id + "." });
				}
			})
			.catch(function(err) {

				res.status(500).json({ code: 9, msg: "Unknown error during get resource " + id + "." });
			});
	}
});

// return list of resources
router.get("/", function(req, res) {

	var force = !!req.get("X-noCache");
	var query = resolver.resolveObject(req.query);
	var cacheKey = JSON.stringify(query);

	if(!force && bCache.keys.indexOf(cacheKey) > -1) {

		//get cache
		res.status(200).json({ code: 0, results: bCache.get(cacheKey) });
	}
	else {

		ResourceController.getResources(query.conditions, query.fields, query.options)
			.then(function(resources) {

				bCache.set(cacheKey, resources);
				res.status(200).json({ code: 0, results: resources });
			})
			.catch(function(err) {

				res.status(500).json({ code: 9, msg: "Internal error" });
			});
	}
});

router.post("/", function(req, res) {

	var body = req.body;

	ResourceController.addResource(body)
		.then(function(results) {

			res.status(200).json({ code: 0, numAffected: results[1], msg: "Successful creating." });			
		})
		.catch(function(err) {

			console.log("Resource insert error: ", err);
			res.status(400).json({ code: 1, msg: "Invalid request." });
		});
});

// replace resource with new obj
router.put("/:id", function(req, res) {

	var body = req.body;
	var id = req.params.id;
	var options = body.options || {};
	options.runValidators = true;

	// key of body.update can't start with '$'
	if(body.update && Object.keys(body.update).some(function(key) { return !/^\$/.test(key); })) {

		ResourceController.updateResource({ resourceId: id }, body.update, options)
			.then(function(results) {

				var num = results[1] ? results[0] : 0;
				if(num > 0) {

					res.status(200).json({ code: 0, msg: "Successful updating." });	
				}
				else {

					res.status(400).json({ code: 4, msg: "Update not affected." });
				}
			})
			.catch(function(err) {

				console.log("Update error: ", err);
				res.status(500).json({ code: 9, msg: "Unkown Error." });
			});	
	}
	else {

		res.status(400).json({ code: 1, msg: "Invalid request." });
	}
});

// update part of resource
router.patch("/:id", function(req, res) {

	var id = req.params.id;
	var validKey = [ "$set", "$unset", "$push", "$pull" ];
	var body = req.body;
	var options = body.options || {};
	options.runValidators = true;

	ResourceController.updateResourceById(id, body.update, options)
		.then(function(newResource) {

			res.status(200).json({ code: 0, msg: "Successful updating", new: newResource });
		})
		.catch(function(err) {

			if(err.cause && err.cause.name == "MongoError") {

				res.status(400).json({ code: 1, msg: "Invalid request", errmsg: err.errmsg });
			}
			else if(err.name === "ValidationError") {

				res.status(400).json({ code: 1, msg: "Invalid request", errors: JSON.stringify(err.errors) });
			}
			else {

				console.log("Update error: ", err);
				res.status(500).json({ code: 9, msg: "Unkown Error" });	
			}
		});
});

router.delete("/:id", function(req, res) {

	var id = req.params.id;
	var body = req.body;

	ResourceController.removeResourceById(id, body.options)
		.then(function(results) {

			var num = results[1] ? results[0] : 0;
			res.status(200).json({ code: 0, numAffected: num, msg: "Successful removing." });
		})
		.catch(function(err) {

			console.log("Resource remove error: ", err);
			res.status(500).json({ code: 9, msg: "Unknown error." });
		});
});

router.delete("/", function(req, res) {

	var body = req.body;

	ResourceController.removeResource(body.conditions, body.options)
		.then(function(results) {

			var num = results[1] ? results[0] : 0;
			res.status(200).json({ code: 0, numAffected: num, msg: "Successful removing." });
		})
		.catch(function(err) {

			console.log("Resource remove error: ", err);
			res.status(500).json({ code: 9, msg: "Unknown error." });
		});
});

module.exports = router;

function prepareCache() {

	ResourceController.getEnableResources()
		.then(function(results) {

			results.forEach(function(resource) {

				sCache.set(resource.resourceId, resource);
			});
		})
		.catch(function(err) {

			console.log("Prepare cache failed. ", err);
		});	

	// ResourceController.... TODO
}