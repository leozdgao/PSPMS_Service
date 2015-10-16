var router = require("express").Router();

var Promise = require("bluebird");
var AccountController = require("../controllers/accountController");
var ResourceController = require("../controllers/resourceController");

var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var resource = {
	resourceId: -1,
	name:'admin',
	account:{
		lastLoginDate: new Date(Date.now()),
		uid: 'admin',
		pwd: 'PxhTxtRAHAqlUEGcIg3fP6OUGE9/91rF4t2m7RV8mMXQ6qdYG3OpWxPOF4MdsToZVUGImgoTI/pzKCoJxEtGFvBxJS4nDcyI2mdNKz9wmF+anU7PJ5zfFNVFdAnK3QjS14ViP4XrErfMfo5CmVEB9h+K00LuSYHsicB+QuWXC40=',
		salt: '12jHFSdlRLszUsnIX8fdxbEL/ar2xl0F2y2vZiKKXy/TIzAkG7CQpf5jJMBjShYuyicQVVBFVueQQ7vfH7Bm0yAe3j+2Ofz5O41838yp32SKogOBQAfXVPJtG5grhBls55G4TZ+IEpSum5dTZ1nfmzu0mwUrq1faJoTQEd8qjsY=',
		role: -1,
	}
};

ResourceController.addResource(resource)
	.then(function(results) {

		console.log('Create Admin successfully');
	})
	.catch(function(err) {

		console.log('Admin account is existed');
	});

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
				session.populate('resource', '-account', function(err, session) {

					res.cookie("token", session.token, { maxAge: 3600000 });
					res.status(200).json({ code: 0, msg: "Login successfully.", session: session });
				});
			})
			.catch(function(err) {
				console.log(err);

				res.status(200).json({ code: 1, msg: "uid or pwd is wrong" });
			});
	}
	else {

		res.status(400).json({ code: 1, msg: "uid or pwd can't be empty." });
	}
});

router.get("/isAuth", function(req, res) {

	if(req.query['token']) {

		AccountController.getSession(req.query['token'])
			.then(function(session) {
				if (session) {
					ResourceController.getResourceById(session['role'])
						.then(function(result){
							result['account'] = undefined;
							res.status(200).json({ ok: 1, user: result });
						});
				} else {
					res.status(200).json({ ok: 0, user:{} });
				}
			});
	} else {
		res.status(400).json({ code: 1, msg: "Invalid user token." });
	}
});

router.get("/logout", function(req, res) {
	var token = req.query.token;

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
	var token = req.query.token;

	// query

	AccountController.getSession(token)
		.then(function(session) {

			if(!session.expire || Date.now() > session.expire) {

				res.status(400).json({ code: 3, msg: "Session expired." });
			}
			else {

				session.populate('resource', '-account', function(err, session) {

					res.status(200).json(session);
				});
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
	var resourceId = body.resourceId;

	if(uid && pwd) {

		AccountController.newUser(resourceId, uid, pwd)
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

// reset the account, only admin have access to it.
router.post('/resetaccount', function(req, res) {

	if(req.isAdmin) {

		var body = req.body;
		var resourceId = body.resourceId;

		AccountController.resetAccount(resourceId)
			.then(function() {
				res.status(200).end();
			})
			.catch(function() {
				res.status(400).end();
			})
	}
	else {

		res.status(401).end();
	}
});

module.exports = router;
