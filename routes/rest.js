var express = require('express');
var router = express.Router();

var config = require("../config.json");

router.use("/company", require("./rest/companyRest"));
router.use("/project", require("./rest/projectRest"));
router.use("/resource", require("./rest/resourceRest"));
router.use("/job", require("./rest/jobRest"));

module.exports = router;
