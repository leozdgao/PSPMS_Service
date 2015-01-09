var mongoose = require("mongoose");

module.exports = {
	User: mongoose.model("User", require("./user")),
	Session: mongoose.model("Session", require("./session")),
	Resource: mongoose.model("Resource", require("./resource"))
}