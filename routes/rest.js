var express = require('express');
var router = express.Router();

var config = require("../config.json");

router.use(require('../middlewares/qresolve')());

router.use("/company", require("./rest/companyRest"));
router.use("/project", require("./rest/projectRest"));
router.use("/resource", require("./rest/resourceRest"));
router.use("/task", require("./rest/jobRest"));
router.use("/statistic", require("./rest/statisticRest"));

module.exports = router;
