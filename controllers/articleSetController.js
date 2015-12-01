var Promise = require("bluebird");

var ArticleSetModel = require("../models/model").ArticleSet;

var RestController = require("./restController");
var ArticleSetController = new RestController(ArticleSetModel);

var mongoose = require('mongoose');

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

ArticleSetController.deleteArticleSet = function(folderPath) {
  var self = this;
  var promise = self.searchArticleSet(folderPath)
    .then(function (dirFolder) {
      if (folderPath.length === 0)
        return new Promise (function (resolve, reject){
          reject('Cannot delete root folder.')
        })
      var update = '{"$unset":{"folders', path = '';
      for (index of folderPath) {
        path += '.' + index
      }
      update += path + '":1}}'
      update = JSON.parse(update);

      return self._updateOne({}, update, { 'new': true });
    })
    .then(function () {
      var update = '{"$pull":{"folders', path = '';
      for (var i = 0; i < folderPath.length - 1; i++) {
        path += '.' + folderPath[i]
      }
      update += path + '":null}}'
      update = JSON.parse(update);

      return self._updateOne({}, update, { 'new': true });
    })
  return promise;
}

ArticleSetController.moveArticleSet = function(conditions, fields, options) {
  // var self = this;
  // var promise = self.searchArticleSet(folderPath)
  //   .then(function (dirFolder) {
  //     var update = '{"$unset":{"folders', path = '';
  //     for (index of folderPath) {
  //       path += '.' + index
  //     }
  //     update += path + '":1}}'
  //     update = JSON.parse(update);
  //
  //     return self._updateOne({}, update, { 'new': true });
  //   })
  // return promise;
}

ArticleSetController.addArticle = function(folderPath, fileID) {
  var self = this;
  var promise = self.searchArticleSet(folderPath);
    .then(function (dirFolder) {

      var update = '{"$push":{"', path = '';
      for (index of folderPath) {
        path += 'folders.' + index;
      }
      if (folderPath.length !== 0) path += '.';
      update += path + 'files":{}}}';
      update = JSON.parse(update);
      update['$push'][path + 'files'] = new mongoose.Types.ObjectId(fileID);

      return self._updateOne({}, update, { 'new': true });
    })
  return promise;
}

ArticleSetController.deleteArticle = function(folderPath) {
  var self = this;
  var promise = self.searchArticleSet(folderPath)
    .then(function (dirFolder) {
      if (folderPath.length === 0)
        return new Promise (function (resolve, reject){
          reject('Cannot delete root folder.')
        })
      var update = '{"$unset":{"folders', path = '';
      for (index of folderPath) {
        path += '.' + index
      }
      update += path + '":1}}'
      update = JSON.parse(update);

      return self._updateOne({}, update, { 'new': true });
    })
    .then(function () {
      var update = '{"$pull":{"folders', path = '';
      for (var i = 0; i < folderPath.length - 1; i++) {
        path += '.' + folderPath[i]
      }
      update += path + '":null}}'
      update = JSON.parse(update);

      return self._updateOne({}, update, { 'new': true });
    })
  return promise;
}

module.exports = ArticleSetController;
