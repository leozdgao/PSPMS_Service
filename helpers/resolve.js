// convert 1 level obj to normal obj
exports.resolveObject = function resolveObject (obj) {

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

// convert normal obj to 1 level obj
exports.resolveString = function resolveString (obj) {

	var result = {};
	return getResolvedObj("", obj, result);

	function getResolvedObj(suf, source, dest) {

		for (var key in source) {

			if(source.hasOwnProperty(key)) {

				var objKey = suf + key;
				var val = source[key];
				// if val is obj
				if(val.toString() === "[object Object]") {

					getResolvedObj(objKey + ".", val, result);
				}
				else {

					result[objKey] = val;
				}
			}
		}

		return dest;
	}
}

exports.stringIsEmpty = function stringIsEmpty(str) {

	if(typeof str === "string") {

		return str.trim() === "";
	}
	else throw new Error("Type error.");
}

exports.isString = function isString(str) {

	return typeof str === "string";
}

exports.isBoolean = function isBoolean(b) {

	return typeof b === "boolean";
}

exports.isNumber = function isNumber(num) {

	return !isNaN(parseFloat(num));
}

exports.isDefined = function isDefined(obj) {

	return typeof obj !== "undefined" && obj !== null;
}

exports.isUndefined = function isUndefined(obj) {

	return typeof obj === "undefined" || obj === null;
}

exports.isEmail = function isEmail(s) {

	return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(s);
}

exports.isDate = function isDate(d) {

	return require("util").isDate(d);
}

exports.isLater = function isLater(d) {
	
	if(require("util").isDate(d)) {

		return +d >= Date.now();
	}
	// else throw new Error("Type error");
	else return false;
}

exports.isValidClientId = function isValidClientId(id) {

	if(typeof id == "string") {

		return id.length == 10;	
	}
	// else throw new Error("Type error");
	else return false;
}

exports.handleError = function handleError(err, status, msg) {

	var error = new Error();
	var err = err || {};

	if(err.cause && err.cause.name == "MongoError") {

		error.status = status || 400;
		error.message = msg ||"Invalid request.";
		error.errors = err.errmsg;
	}
	else if(err.name === "ValidationError") {

		error.status = status || 400;
		error.message = msg ||"Invalid request.";
		error.errors = JSON.stringify(err.errors);
	}
	else {

		error.status = status || 500;
		error.message = msg || "Unkown error.";
	}

	return error;
}
