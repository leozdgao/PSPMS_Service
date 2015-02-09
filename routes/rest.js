var express = require('express');
var router = express.Router();

var config = require("../config.json");
// open authentication for every
if(config.auth) router.use(require('../middlewares/auth')());

router.use("/company", require("./rest/companyRest"));
router.use("/project", require("./rest/projectRest"));
router.use("/resource", require("./rest/resourceRest"));
router.use("/job", require("./rest/jobRest"));

module.exports = router;
