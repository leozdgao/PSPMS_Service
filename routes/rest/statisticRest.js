var express = require("express");
var qs = require('qs');
var router = express.Router();

var StatisticController = require("../../controllers/statisticController");
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

router.get("/", function (req, res, next) {

	// var query = resolver.resolveObject(req.query);
	var query = qs.parse(req.query, { allowDots: true });

	StatisticController.getStatistic(query.conditions, query.fields, query.options, req.isAdmin, function(err, result){
		if (err == null) {
			res.status(200).json(result);
		} else{
			var err = resolver.handleError(err, 400);
			next(err);
		}
	});
});

router.use(require("body-parser").json());

router.use(function(req, res) {

	res.redirect("/rest/company/help");
});

module.exports = router;
