var express = require('express');
var router = express.Router();

router.route("/")
	.get(function(req, res) {

		res.end();
	})
	.post(function(req, res) {

		res.end();
	})
	.put(function(req, res) {

		res.end();
	})
	.delete(function(req, res) {

		res.end();
	});

module.exports = router;