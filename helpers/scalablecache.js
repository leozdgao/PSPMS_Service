module.exports = ScalableCache;

function ScalableCache(capacity) {

	this.capacity = capacity;
	this.keys = [];
	this.cache = {};
}

ScalableCache.prototype.set = function(token, session) {

	var index = this.keys.indexOf(token);
	// overflow
	if(index < 0 && this.keys.length >= this.capacity) {

		// remove old key
		var oldKey = this.keys.shift();
		delete this.cache[oldKey];
	}

	// set cache and key
	this.cache[token] = session;
	if(index < 0) this.keys.push(token);
}

ScalableCache.prototype.get = function(token) {

	return this.cache[token];
}

ScalableCache.prototype.remove = function(id) {

	var index = this.keys.indexOf(id);

	if(index > -1) {

		this.keys.splice(index);
		this.cache[id] = void(0);
	}
}

ScalableCache.prototype.clear = function() {

	this.keys = [];
	this.cache = {};
}