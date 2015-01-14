var express = require('express');
var router = express.Router();

var config = require("../config.json");
// open authentication for every
if(config.auth) router.use(require('../middlewares/auth')());

// router.use("/company", require("./rest/companyRest"));
// router.use("/project", require("./rest/projectRest"));
router.use("/resource", require("./rest/resourceRest"));
// router.use("/job", require("./rest/jobRest"));

module.exports = router;

// code
// 0 - success
// 1 - invalid request
// 2 - unAuthorized
// 3 - not find
// 9 - internal error

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
