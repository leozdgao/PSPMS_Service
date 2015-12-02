module.exports = function() {
	return function (req, res, next) {

				var objectParser = function (query) {
					for (var prop in query) {
						if (query.hasOwnProperty(prop)) {
							if (typeof query[prop] == 'string') {
								if (query[prop] == 'true') {
									query[prop] = true;
								} else if(query[prop] == 'false') {
									query[prop] = false;
								} else if (isNaN(Number(query[prop])) == false) {
									query[prop] = Number(query[prop]);
								} else if (isNaN(Date.parse(query[prop])) == false) {
									query[prop] = Date.parse(query[prop]);
								}
							} else if (typeof query[prop] == 'object') {
								query[prop] = objectParser(query[prop]);
							}
						}
					}
					return query;
				}

		try {
			var query = req.query;
			query = objectParser(query);
			req.query = query;
		}
		catch(ex) {}

		next();
	}
}
