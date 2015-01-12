var router = require("express").Router();

var Promise = require("bluebird");
var AccountController = require("../controllers/accountController");

var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// code:
// - 0  success
// - 1  wrong uid or pwd
// - 2  miss token
// - 3  session expired
// - 4  user existed
// - 9  unknown internal error

router.post("/login", function(req, res) {
	var body = req.body;
	var uid = body.uid;
	var pwd = body.pwd;

	if(uid && pwd) {

		AccountController.checkPassword(uid, pwd)
			.then(function(user) {
				console.log("After check password.");

				return Promise.all([AccountController.generateSession(user),
									AccountController.updateLoginDate(user._id)]);
			})
			.then(function(results) {

				var session = results[0][0];
				console.log('After generate Session');

				res.cookie("token", session.token, { maxAge: 3600000 });
				res.status(200).json({ code: 0, msg: "Login successfully.", session: session });
			})
			.catch(function(err) {
				console.log(err);

				res.status(400).json({ code: 1, msg: "uid or pwd is wrong" });
			});
	}
	else {

		res.status(400).json({ code: 1, msg: "uid or pwd can't be empty." });
	}
});

router.get("/logout", function(req, res) {
	var token = req.param("token");

	if(typeof token != "undefined") {

		AccountController.removeSession(token)
			.then(function() {
				res.status(200).json({ code: 0, msg: "Logout successfully." });
			})
			.catch(function() {
				res.status(400).json({ code: 9, msg: "Error occurred while remove session." });
			});
	}
	else {

		res.status(400).json({ code: 2, msg: "Can't logout without token." });
	}
});

// Session structure
// - token
// - uid (get from resource)
// - role

router.get("/relog", function(req, res) {
	var token = req.param("token");

	// query

	AccountController.getSession(token)
		.then(function(session) {

			if(!session.expire || Date.now() > session.expire) {

				res.status(400).json({ code: 3, msg: "Session expired." });
			}
			else {

				res.status(200).json(session);	
			}
			
		})
		.catch(function() {

			res.status(400).json({ code: 9, msg: "Error occurred while getting session." });
		});
});

router.post("/signup", function(req, res) {

	var body = req.body;
	var uid = body.uid;
	var pwd = body.pwd;

	if(uid && pwd) {

		AccountController.newUser(uid, pwd)
			.then(function(user) {

				res.status(200).json(user);
			})
			.catch(function(err) {

				if(err === "User already exist") {

					res.status(400).json({ code: 4, msg: "User already exist." });
				}
				else {

					res.status(400).json({ code: 9, msg: "Error occurred while creating user." });	
				}
			});
	}
	else {

		res.status(400).json({ code: 1, msg: "uid or pwd can't be empty." });
	}
});

module.exports = router;
