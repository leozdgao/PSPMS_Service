module.exports = function() {
	return function (req, res, next) {

		var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
		    var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
		   
		    JSON.dateParser = function (key, value) {
		        if (typeof value === 'string') {
		            var a = reISO.exec(value);
		            if (a) return new Date(value);
		            a = reMsAjax.exec(value);
		            if (a) {
		                var b = a[1].split(/[-+,.]/);
		                return new Date(b[0] ? +b[0] : 0 - +b[1]);
		            }
		        }
		        return value;
		    };

		try {
			var query = JSON.parse(req.query.q, JSON.dateParser);
			req.query = query;
		}
		catch(ex) {}

		next();
	}	
}
