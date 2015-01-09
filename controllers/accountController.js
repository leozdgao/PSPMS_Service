var Promise = require("bluebird");

var model = require("../data/model");
var dataHash = require("../helpers/hash");
var hash = dataHash.hash;
var md5 = dataHash.md5;

var User = model.User;
var Session = model.Session;

exports.checkPassword = function(uid, pwd) {

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

exports.generateSession = function(user) {

	var secret = new Date().toGMTString() + "SECRET" + user.name;

	//remove exist session
	return Session.removeAsync({ name: user.name })
				.then(function() {

					var session = new Session();
					session.name = user.name;
					session.role = user.role;
					session.token = md5(secret);
					session.expire = Date.now() + 3600000; // session expired after an hour

					return session.saveAsync();
				});
};

exports.getSession = function(token) {

	return Session.findOneAsync({ token: token });
}

exports.removeSession = function(token) {

	return Session.removeAsync({ token: token });
};
