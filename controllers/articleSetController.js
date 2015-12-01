var Promise = require("bluebird");

var ArticleSetModel = require("../models/model").ArticleSet;

var RestController = require("./restController");
var ArticleSetController = new RestController(ArticleSetModel);

var resolver = require("../helpers/resolve");

ArticleSetController.getArticleSet = function(conditions, fields, options) {
	return this._findOne(conditions, fields, options);
}

ArticleSetController.searchArticleSet = function(folderPath) {
  var promise = this.getArticleSet()
    .then(function (articleSet) {
      return new Promise (function (resolve, reject) {
        var tempSet = articleSet
        if (folderPath === undefined) resolve(tempSet)
        for (var path of folderPath) {
          tempSet = tempSet['folders'][path]
          if (tempSet === undefined) reject('Cannot find such article set.')
        }
        resolve(tempSet)
      })
    })
  return promise;
}

ArticleSetController.addArticleSet = function(folderPath, folderName) {

  var self = this;
  var promise = self.searchArticleSet(folderPath)
    .then(function (dirFolder) {
      if (dirFolder === undefined) reject();

      var newSet = new ArticleSetModel({ name: folderName });
      var update = '{"$push":{"folders', path = '';
      for (index of folderPath) {
        path += '.' + index + '.folders'
      }
      update += path + '":{}}}'
      update = JSON.parse(update);
      update['$push']['folders' + path] = newSet;

      return self._updateOne({}, update, { 'new': true });
    })
  return promise;
}

module.exports = ArticleSetController;
