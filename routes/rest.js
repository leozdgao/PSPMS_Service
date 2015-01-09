var express = require('express');
var router = express.Router();

var authMiddleware = require('../middlewares/auth');

// open authentication for every
router.use(authMiddleware());

// router.use("/company", require("./rest/companyRest"));
// router.use("/project", require("./rest/projectRest"));
router.use("/resource", require("./rest/resourceRest"));
// router.use("/job", require("./rest/jobRest"));

module.exports = router;

// var config = {
// 	"/resource": {
// 		get: false,
// 		post: -1,
// 		put: -1
// 	},
// 	"/company": {
// 		get: false,
// 		post: 2,
// 		put: 2
// 	},
// 	"/project": {
// 		get: false,
// 		post: 2,
// 		put: 2
// 	},
// 	"/job": {
// 		get: false,
// 		post: 2,
// 		put: 1
// 	}
// }
