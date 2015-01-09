module.exports = ScalableCache;

function ScalableCache(capacity) {

	this.capacity = capacity;
	this.keys = [];
	this.cache = {};
}

ScalableCache.prototype.set = function(token, session) {

	// overflow
	if(this.keys.length >= this.capacity) {

		// remove old key
		var oldKey = this.keys.shift();
		delete this.cache[oldKey];
	}

	// set cache and key
	this.cache[token] = session;
	this.keys.push(token);
}

ScalableCache.prototype.get = function(token) {

	return this.cache[token];
}