module.exports = RestController;

// constructor recieve a mongoose model
function RestController(model) {

	this.model = model;
}

RestController.prototype._findOne = function(conditions, fields, options) {
	
	var Model = this.model;

	return Model.findOneAsync(conditions, fields, options);
};

RestController.prototype._query = function(conditions, fields, options) {

	var Model = this.model;

	return Model.findAsync(conditions, fields, options);
}

RestController.prototype._insert = function(obj) {

	var Model = this.model;
	var newObj = new Model(obj);

	return newObj.saveAsync();
}

RestController.prototype._update = function(conditions, update, options) {

	var Model = this.model;

	return Model.updateAsync(conditions, update, options);
}

RestController.prototype._updateOne = function(conditions, update, options) {

	var Model = this.model;

	return Model.findOneAndUpdateAsync(conditions, update, options);
}

RestController.prototype._remove = function(conditions) {

	var Model = this.model;

	return Model.removeAsync(conditions);
}

RestController.prototype._removeOne = function(conditions) {

	var Model = this.model;

	return Model.findOneAndRemoveAsync(conditions);
}