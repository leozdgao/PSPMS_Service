var mongoose = require("mongoose");

module.exports = {
	Session: mongoose.model("Session", require("./schemas/session")),
	Resource: mongoose.model("Resource", require("./schemas/resource")),
	Company: mongoose.model("Company", require("./schemas/company")),
	Project: mongoose.model("Project", require("./schemas/project")),
	Job: mongoose.model("Job", require("./schemas/job")),
	Trunk: mongoose.model("Trunk", require("./schemas/trunk"))
}
