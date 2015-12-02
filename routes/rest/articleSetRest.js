var express = require('express');
var router = express.Router();
var qs = require('qs');

var ArticleSetController = require("../../controllers/articleSetController");
var resolver = require("../../helpers/resolve");

var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use("/help", function(req, res) {

	res.status(200).json({
		availableApi: require("./helpers.json").company
	});
});

// auth
// router.use(function(req, res, next) {
//
// 	// only leader can modify companies
// 	if(req.needAuth && req.method !== "GET" && !req.isLeader) {
//
// 		next(resolver.handleError(null, 401, "UnAuthorized."));
// 	}
// 	else next();
// });

router.get("/", function(req, res, next) {
	var query = qs.parse(req.query, { allowDots: true });
	ArticleSetController.searchArticleSet(query['folders'])
		.then(function(articleSet) {
			res.status(200).json({ok:1, result: articleSet});
		})
		.catch(function(errMsg) {
			var err = resolver.handleError(err, 400, {ok:0, result: errMsg});
			next(err);
		});
});

router.post("/", function(req, res, next) {
	var body = req.body;
	ArticleSetController.addArticleSet(body['folders'], body['name'])
		.then(function(articleSet) {
				res.status(200).json({ok:1, result: articleSet});
		})
		.catch(function(errMsg) {
			var err = resolver.handleError(null, 400, {ok:0, result: errMsg});
			next(err);
		});
});

router.delete("/", function(req, res, next) {
	var body = req.body;
	ArticleSetController.deleteArticleSet(body['folders'])
		.then(function(articleSet) {
				res.status(200).json({ok:1, result: articleSet});
		})
		.catch(function(errMsg) {
			var err = resolver.handleError(null, 400, {ok:0, result: errMsg});
			next(err);
		});
});

router.put("/", function(req, res, next) {
	var body = req.body;
	ArticleSetController.moveArticleSet(body['folders'], body['toFolder'])
		.then(function(articleSet) {
				res.status(200).json({ok:1, result: articleSet});
		})
		.catch(function(errMsg) {
			var err = resolver.handleError(null, 400, {ok:0, result: errMsg});
			next(err);
		});
});

router.post("/article", function(req, res, next) {
	var body = req.body;
	ArticleSetController.addArticle(body['folders'], body['fileID'])
		.then(function(articleSet) {
				res.status(200).json({ok:1, result: articleSet});
		})
		.catch(function(errMsg) {
			var err = resolver.handleError(null, 400, {ok:0, result: errMsg});
			next(err);
		});
});

router.delete("/article", function(req, res, next) {
	var body = req.body;
	ArticleSetController.deleteArticle(body['folders'], body['fileID'])
		.then(function(articleSet) {
				res.status(200).json({ok:1, result: articleSet});
		})
		.catch(function(errMsg) {
			var err = resolver.handleError(null, 400, {ok:0, result: errMsg});
			next(err);
		});
});

module.exports = router;
