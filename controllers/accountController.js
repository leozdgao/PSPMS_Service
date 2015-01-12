var Promise = require("bluebird");

var model = require("../models/model");
var dataHash = require("../helpers/hash");
var hash = dataHash.salthash;
var md5 = dataHash.md5;

var User = model.User;
var Session = model.Session;

exports.checkPassword = function checkPassword(uid, pwd) {

	return new Promise(function(resolve, reject) {

		var user;

		User.findOneAsync({name: uid})
			.then(function(u) {

				if(u != null) {
					
					user = u;

					return hash(pwd, user.salt);
				}
				// can't find user
				else {

					reject("Can't find user.");	
				} 
			})
			.then(function(code) {

				if(user.password === code) {

					resolve(user);
				}
				// wrong password
				else {

					reject("Wrong password.");
				}
			})
			.catch(function(err) {

				reject();
			});
	});
};

exports.checkUnique = function checkUnique(uid) {

	return new Promise(function(resolve, reject) {

		User.findOneAsync({name: uid})
			.then(function(user) {

				if(user == null) resolve();
				else reject("User already exist");
			})
			.catch(function(err) {

				reject(err);
			});
	});
}

exports.newUser = function newUser(uid, pwd) {

	return new Promise(function(resolve, reject) {

		// check uid
		exports.checkUnique(uid)
			.then(function() {

				return hash(pwd);
			})
			.then(function(results) {

				var newUser = new User();
				newUser.name = uid;
				newUser.salt = results[0];
				newUser.password = results[1];

				return newUser.saveAsync();
			})
			.then(function(results) {

				// [ user, numAffected ]
				var num = results[1];
				if(num >= 1) {

					resolve(results[0]);	
				}
				else {

					reject("Unknown error");
				}
			})
			.catch(function(err) {

				reject(err);
			});
	});
}

exports.generateSession = function generateSession(user) {

	var secret = new Date().toGMTString() + "SECRET" + user.name;

	//remove exist session
	return Session.removeAsync({ name: user.name })
				.then(function() {

					var session = new Session();
					session.uid = user._id;
					session.name = user.name;
					session.role = user.role;
					session.token = md5(secret);
					session.expire = Date.now() + 3600000; // session expired after an hour

					return session.saveAsync();
				});
};

exports.getSession = function getSession(token) {

	return Session.findOneAsync({ token: token });
}

exports.removeSession = function removeSession(token) {

	return Session.removeAsync({ token: token });
};

exports.updateLoginDate = function updateLoginDate(uid) {

	return User.updateAsync({ _id: uid }, { $currentDate: { lastLoginDate: true } }); 
}
