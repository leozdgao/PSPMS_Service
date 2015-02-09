var Promise = require("bluebird");

var model = require("../models/model");
var dataHash = require("../helpers/hash");
var hash = dataHash.salthash;
var md5 = dataHash.md5;

var Resource = model.Resource;
var Session = model.Session;

exports.checkPassword = function checkPassword(uid, pwd) {

	return new Promise(function(resolve, reject) {

		var user;

		Resource.findOneAsync({'account.uid': uid})
			.then(function(u) {

				if(u != null) {
					
					user = u;

					return hash(pwd, user.account.salt);
				}
				// can't find user
				else {

					reject("Can't find user.");	
				}
			})
			.then(function(code) {

				if(user.account.pwd === code) {

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

		Resource.findOneAsync({'account.uid': uid})
			.then(function(user) {

				if(user == null) resolve();
				else reject("User already exist");
			})
			.catch(function(err) {

				reject(err);
			});
	});
}

exports.newUser = function newUser(resourceId, uid, pwd, role) {

	return new Promise(function(resolve, reject) {

		// check uid
		exports.checkUnique(uid)
			.then(function() {

				return hash(pwd);
			})
			.then(function(results) {

				return Resource.findOneAsync({ _id: resourceId })
					.then(function(resource) {

						if(resource != null) {

							resource.account = resource.account || {};
							resource.account.uid = uid;
							resource.account.salt = results[0];
							resource.account.pwd = results[1];
							resource.account.role = role || 1;

							return resource.saveAsync();
						}
						else {
							reject(404);
						}
					})
					.catch(function(err) {

						reject(err);
					});
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

exports.generateSession = function generateSession(resource) {

	var secret = new Date().toGMTString() + "SECRET" + resource.account.uid;

	//remove exist session
	return Session.removeAsync({ resource: resource._id })
				.then(function() {

					var session = new Session();
					session.resource = resource._id;
					session.role = resource.account.role;
					session.token = md5(secret);
					session.expire = Date.now() + 3600000; // session expired after an hour

					return session.saveAsync();
				});
};

exports.getSession = function getSession(token) {

	return Session.findOneAsync({ token: token });
};

exports.removeSession = function removeSession(token) {

	return Session.removeAsync({ token: token });
};

exports.updateLoginDate = function updateLoginDate(uid) {

	return Resource.updateAsync({ _id: uid }, { $currentDate: { 'account.lastLoginDate': true } }); 
};
