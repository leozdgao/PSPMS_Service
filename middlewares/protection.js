module.exports = function() {

	// if 200 requests were recieved in 1 min from the same ip, delay response for 2min
	var banList = [];
	var record = {};

	setInterval(function() { 

		//refresh record every 1min
		record = {};
	}, 60000);

	return function(req, res, next) {

		var requestIp = req.ip;
		var times = record[requestIp] ? ++record[requestIp] : (record[requestIp] = 1);
		var index;

		if(times >= 200) {

			banList.push(requestIp);

			index = banList.indexOf(requestIp);

			setTimeout(function() {

				banList.splice(index);
			}, 120000);
		}

		console.log(record);

		if(index > -1) res.status(403).end();
		else next();
	}
}