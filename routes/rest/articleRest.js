var router = require('express').Router();
var Article = require('../../models/article');
var qs = require('qs')

router.param('article_id', function(req, res, next, id) {
  req.article_id = id;
  next();
});

router.use(function (req, res, next) {
  if (req.query) {
    req.query = qs.parse(req.query, { allowDots: true });
  }
  next()
})

router.get('/count', function(req, res, next) {
  var query = req.query;
  Article.count(query.conditions)
    .then(function(c) {
      res.json({count: c});
    })
    .catch(function(err) {
      next(err);
    });
});

router.get('/tags', function(req, res, next) {
  Article.tags()
    .then(function(ret) {
      var tags = ret[0][0].value;
      res.json(tags);
    })
    .catch(function(err) {
      next(err);
    });
});

router.get('/', function(req, res, next) {
  var query = req.query;
  Article.query(query.conditions, query.fields, query.options)
    .then(function(articles) {
      res.json(articles);
    })
    .catch(function(err) {
      next(err);
    });
});

router.get('/:article_id', function(req, res, next) {
    var query = req.query;
    Article.get(req.article_id, query.fields, query.options)
      .then(function(article) {
        res.json(article);
      })
      .catch(function(err) {
        next(err);
      });
});

router.post('/', require('body-parser').json(), function(req, res, next) {
  Article.post(req.body)
    .then(function(result) {
      res.json(result[0]);
    })
    .catch(function(err) {
      next(err);
    });
});

router.put('/:article_id', require('body-parser').json(), function(req, res, next) {
  Article.update(req.article_id, req.body)
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      next(err);
    });
});

router.delete('/:article_id', function(req, res, next) {
  Article.remove(req.article_id)
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      next(err);
    });
});

module.exports = router;
