exports.resolveObject = function(obj) {

	var result = {};

	for (var key in obj) {

		var subs = key.split('.');
		var temp = result;

		for (var i = 0; i < subs.length; i++) {

			var subkey = subs[i];
			if(i == subs.length - 1) {
				
				temp[subkey] = obj[key];	
			} 
			else {

				temp[subkey] = temp[subkey] || {};
				temp = temp[subkey];	
			}
		}
	}

	return result;
}

exports.stringIsEmpty = function(str) {

	if(typeof str === "string") {

		return str.trim() === "";
	}
	else throw new Error("type error.");
}