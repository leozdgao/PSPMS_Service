var mongoose = require("mongoose");

module.exports = {
	User: mongoose.model("User", require("./schemas/user")),
	Session: mongoose.model("Session", require("./schemas/session")),
	Resource: mongoose.model("Resource", require("./schemas/resource"))
}