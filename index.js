
var express = require('express');
var bodyParser = require('body-parser')

module.exports = function (options) {

  var router = express.Router();

  router.use(bodyParser.json());


  var resource = new Resource(options);

  Object.keys(Resource.routes).forEach(function (routeName) {
    var route = Resource.routes[routeName];
    router[route.method](route.path, resource[routeName]());
  });

  return router;
};


var Resource = function (options) {

  if (! options.db) {
    throw new Error('Must provide "db" option.')
  }

  if (typeof options.db !== 'function') {
    var db = options.db;
    options.db = function () {
      return db;
    }
  }

  options.error = options.error || function (err) {
    console.error(err);
  };

  this.options = options;
};

Resource.routes = {
  'list': { method: 'get', path: '/' },
  'get': { method: 'get', path: '/:id' },
  'post': { method: 'post', path: '/' },
  'put': { method: 'put', path: '/:id' },
  'delete': { method: 'delete', path: '/:id' },
};


Resource.prototype.unsupportedMediaType = function (req, res) {
  if (! req.is('json')) {
    res.status(415).end();
    return true;
  }
};

Resource.prototype.unacceptable = function (req, res) {
  if (! req.accepts('json')) {
    res.status(406).end();
    return true;
  }
};


Resource.prototype.list = function () {
  var that = this;

  return function (req, res, next) {
    if (that.unacceptable(req, res)) return;

    that.options.db().find({}, function (err, docs) {
      if (err) {
        that.options.error(err);
        return res.status(500).end();
      }
      res.json(docs);
    });
  };
};

Resource.prototype.get = function () {
  var that = this;
  
  return function (req, res, next) {
    if (that.unacceptable(req, res)) return;

    var id = req.params.id;

    that.options.db().findOne({_id: id}, function (err, doc) {
      if (err) {
        that.options.error(err);
        return res.status(500).end();
      }
      if (! doc) {
        res.status(404).end();
        return;
      }
      res.json(doc);
    });
  };
};

Resource.prototype.post = function () {
  var that = this;
  
  return function (req, res, next) {
    if (that.unsupportedMediaType(req, res)) return;
    if (that.unacceptable(req, res)) return;

    var doc = req.body;

    that.options.db().insert(doc, function (err, newDoc) {
      if (err) {
        that.options.error(err);
        return res.status(500).end();
      }
      res.status(201).json(newDoc);
    });
  };
};

Resource.prototype.put = function () {
  var that = this;
  
  return function (req, res, next) {
    if (that.unsupportedMediaType(req, res)) return;
    if (that.unacceptable(req, res)) return;

    var id = req.params.id;
    var doc = req.body;

    var query = {
      _id: id
    };
    var options = {};

    that.options.db().update(query, doc, options, function (err, numReplaced) {
      if (err) {
        that.options.error(err);
        return res.status(500).end();
      }
      if (numReplaced === 0) {
        return res.status(404).end();
      }
      res.status(204).end();
    });
  };
};

Resource.prototype.delete = function () {
  var that = this;
  
  return function (req, res, next) {
    var id = req.params.id;

    var query = {
      _id: id
    };
    var options = {};

    that.options.db().remove(query, options, function (err, numRemoved) {
      if (err) {
        that.options.error(err);
        return res.status(500).end();
      }
      if (numRemoved === 0) {
        return res.status(404).end();
      }
      res.status(204).end();
    });
  };
};
