var Promsie = require("bluebird");
var AccountController = require("../controllers/accountController");
var Cache = require("../helpers/scalablecache");

module.exports = function() {

	// cache for session
	var sessionCache = new Cache(500);

	return function(req, res, next) {

		var token = req.query.token;
		if(token) {

			// try get session from cache
			var session = sessionCache.get(token);
			if(session) {

				setRequest(session);
				next();
			}
			else {

				AccountController.getSession(token)
					.then(function(session) {

						//save cache
						sessionCache.set(token, session || void(0));
						setRequest(session);
					})
					// .catch(function() {  })
					.finally(function() {

						next();
					});
			}
		}
		else next();

		function setRequest(session) {

			var session = session.expire >= Date.now() ? session :  {};
				
			req.session = session;
			req.isAuth = !!session.role;
			req.isMember = session.role >= 1;
			// req.isLeader = session.role >=2;
			req.isAdmin = session.role < 0;
		}
	}
}