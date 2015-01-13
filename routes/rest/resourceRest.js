var express = require('express');
var router = express.Router();

var ResourceController = require("../../controllers/resourceController");
var resolver = require("../../helpers/resolve");

var Cache = require("../../helpers/scalablecache");
var sCache = new Cache(50);
var bCache = new Cache(500);

// put enable resource in cache first
prepareCache();


router.param("id", function(req, res, next, id) {

	if(!resolver.isNumber(id)) {

		res.status(400).json({ code: 1, msg: "Invalid id." });
	}
	else {

		next();
	}
});

router.get("/:id", function(req, res) {

	var id = req.params.id;
	var force = !!req.get("X-noCache");
	var query = resolver.resolveObject(req.query);

	if(!force && sCache.keys.indexOf(id) > -1) {

		//get cache
		res.status(200).json({ code: 0, results: sCache.get(id) });
	}
	else {

		ResourceController.getResourceById(id, query.fields, query.options)
			.then(function(resource) {

				sCache.set(id, resource);
				res.status(200).json({ code: 0, results: resource });
			})
			.catch(function(err) {

				res.status(500).json({ code: 9, msg: "Internal error" });
			});	
	}
});

router.get("/", function(req, res) {

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

router.use(function(req, res, next) {

	if(req.isAdmin || req.isLeader) {

		next();
	}
	else {

		res.status(401).json({ code: 2, msg: "UnAuthorized." });
	}
});

router.use(require("body-parser").json());

router.post("/", function(req, res) {

	var body = req.body;

	ResourceController.addResource(body)
		.then(function(results) {

			res.status(200).json({ code: 0, numAffected: results[1], msg: "Successful creating" });			
		})
		.catch(function(err) {

			console.log("Resource insert error: ", err);
			res.status(400).json({ code: 1, msg: "Invalid request." });
		});
});

router.put("/", function(req, res) {

	var body = req.body;

	ResourceController.updateResource(body.conditions, body.update, body.options)
		.then(function(results) {

			var num = results[1] ? results[0] : 0;
			res.status(200).json({ code: 0, numAffected: num, msg: "Successful updating" });
		})
		.catch(function(err) {

			console.log("Update error: ", err);
			res.status(500).json({ code: 9, msg: "Unkown Error" });
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