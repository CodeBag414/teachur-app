// Load required packages
var mongoose = require('mongoose');
var Promise = require('bluebird');
var moment = require('moment');
var fs = require('fs');
var countComponents = require('../lib/countComponents');
var _ = require('lodash');
var exportItem = require('../lib/exportItem');

// POST /api/degrees
exports.create = function (req, res) {
  var currentUser = req.user;
  var degree = new req.models.Degree();
  var data = req.body;

  degree = populateDegree(degree, data, currentUser);

  return req.models.Keyword.updateKeywords(data.keywords)
  .then(function(keywords) {
    degree.keywords = keywords;
    degree.save(function (err) {
      if (err)
        return res.send(err);

      currentUser.addToMyModules(degree, 'degree', function () {
        res.json(degree);
      });

    });
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });
};

// PUT /api/degrees
exports.update = function (req, res) {
  var currentUser = req.user;
  var data = req.body;

  req.models.Degree.findById(req.params.id, function (err, degree) {

    if (!degree) {
      return res.status(404).send('Not found').end();
    }

    if (currentUser._id.equals(degree.author) || currentUser.admin) {
      degree = populateDegree(degree, data, currentUser);
      return req.models.Keyword.updateKeywords(data.keywords)
      .then(function(keywords) {
        degree.keywords = keywords;
        degree.save(function (err) {
          if (err)
            return res.send(err);

          req.models.Degree.findById(req.params.id).deepPopulate('author relatedDegrees prerequisites components projects projects.author projects.files projects.files.author keywords prerequisites.components.image relatedDegrees.components.image').exec(function (err, degree) {
            if (err)
              return res.send(err);

            res.json(degree);
          });

        });
      })
      .catch(function(err) {
        console.error(err.stack || err);
        return res.status(500).send(err);
      });
    } else {
      res.status(403).send('Forbidden');
    }

  });
};

// GET /api/degrees/:id
exports.getOne = function (req, res) {
  req.models.Degree.findById(req.params.id).deepPopulate('author relatedDegrees prerequisites components components.image projects projects.author projects.files projects.files.author keywords prerequisites.components.image relatedDegrees.components.image components.projects.files components.components.projects.files components.components.components.projects.files components.projects.author components.components.projects.author components.components.components.projects.author').exec(function (err, degree) {
    if (err)
      return res.send(err);

    if (!degree) {
      return res.status(404).send('Not found').end();
    }

    return res.json(degree);

  });
};

// GET /api/degrees
exports.getAll = function (req, res) {
  if (!req.user) {
    return req.models.Degree.find({
      published: true,
      private: false
    })
    .deepPopulate('author relatedDegrees prerequisites components components.image')
    .then(function (degrees) {
      return res.json({degrees: degrees});
    });
  }

  var authorId = req.user._id;
  req.models.Degree.find({
    $or: [{
      published: true,
      private: false
    }, {author: authorId}]
  })
  .deepPopulate('author relatedDegrees prerequisites components components.image')
  .then(function (degrees) {
    return res.json({degrees: degrees});
  });
};

exports.getAllByAuthor = function (req, res) {
  var authorId = req.user._id;
  var limit = req.query.limit || 21;
  var page = req.query.page || 1;
  var skip = (page - 1) * limit;
  
  req.models.Degree
  .find({author: authorId})
  .limit(limit)
  .skip(skip)
  .deepPopulate('author relatedDegrees prerequisites components components.image')
  .then(function (degrees) {
    return res.json(degrees);
  });
};

// GET /api/degrees/:id/current-use
exports.getCurrentUse = function (req, res) {
  var itemId = req.params.id;
  var currentUse = {
    degrees: []
  };

  req.models.Degree.find({
    $or: [
      {prerequisites: itemId},
      {relatedDegrees: itemId}
    ]
  })
  .deepPopulate('image prerequisites.components.image relatedDegrees.components.image')
  .then(function (items) {
    currentUse.degrees = items;
    return res.json(currentUse);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  })
};

exports.delete = function (req, res) {
  var itemId = req.params.id;

  req.models.Degree.findById(req.params.id).exec(function (err, item) {
    if (err)
      return res.send(err);

    if (!item) {
      return res.status(404).send('Not found').end();
    }

    var currentUser = req.user;
    if (currentUser._id.equals(item.author) || currentUser.admin) {
      item.remove(function (err, success) {
        if (err)
          return res.send(err);

        res.json({success: true});
      })
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

exports.search = function (req, res) {
  var limit = req.query.limit;
  var skip = (req.query.page - 1) * req.query.limit;
  var searchByTitle = parseInt(req.query.searchByTitle);
  var isPopulated = parseInt(req.query.populate);
  var admin = req.query.admin === 'true' && req.user.admin;
  var order = req.query.order || 'name';

  var searchText = new RegExp(req.query.searchText, 'i'),
    generateRegExp = function (text) {
      var wordsArr = text.split(' '),
        resultString = '/^';

      _.forEach(wordsArr, function (word, index) {
        //    resultString += index === 0 ? "\\b" + word + "\\b" : ".*\\b" + word + "\\b";
        resultString += "(?=.*\\b" + word + "\\b)";
      });

      return resultString;
    };

  var finalRegex = req.query.searchText.split(' ').length > 1 ? generateRegExp(req.query.searchText) : searchText;

  var admin = req.query.admin === 'true' && req.user.admin;
  var query = admin ? {name: searchText} : {
    name: searchText,
    published: true,
    $or: [{private: false}, {private: null}]
  };

  if (searchByTitle === 1) {

    req.models.Degree.count(query).exec(function (err, count) {

      if (!limit) {
        limit = count <= 100 ? count : 100;
      }

      req.models.Degree
      .find(query)
      .deepPopulate('author relatedDegrees prerequisites components components.image')
      .sort(order)
      .limit(limit)
      .skip(skip)
      .then(function (degrees) {
        if (admin) {
          return Promise.each(degrees, function(item, i) {
            return countComponents(item._id, 'degree', req.models)
            .then(function(result) {
              item.statistics = result;
              return degrees[i] = item;
            })
          })
          .then(function() {
            return res.json({items: degrees, count: count});
          });
        }

        return res.json({items: degrees, count: count});
      });
    });
  } else {

    query = admin ? {name: searchText} : {
      published: true,
      $and: [{$or: [{private: false}, {private: null}]}, {$or: [{shortDescription: searchText}, {longDescription: searchText}]}]
    };

    if (req.query.searchText === '') {
      query = {
        published: true,
        $or: [{private: false}, {private: null}]
      };
    }

    req.models.Degree.count(query).exec(function (err, count) {

      if (!limit) {
        limit = count <= 100 ? count : 100;
      }

      req.models.Degree
      .find(query)
      .deepPopulate('author relatedDegrees prerequisites components components.image')
      .sort(order)
      .limit(limit)
      .skip(skip)
      .then(function (degrees) {
        if (admin) {
          return Promise.each(degrees, function(item, i) {
            return countComponents(item._id, 'degree', req.models)
            .then(function(result) {
              item.statistics = result;
              return degrees[i] = item;
            })
          })
          .then(function() {
            return res.json({items: degrees, count: count});
          });
        }

        return res.json({items: degrees, count: count});

      });
    });
  }
};

exports.getStatistics = function (req, res) {
  var todayStart = moment().startOf('day').format();
  var thisWeekStart = moment().startOf('isoweek').format();
  var thisMonthStart = moment().startOf('month').format();

  var todayQuery = {createdAt: {$gt: todayStart}};
  var thisWeekQuery = {createdAt: {$gt: thisWeekStart}};
  var thisMonthQuery = {createdAt: {$gt: thisMonthStart}};

  return Promise.all([
      req.models.Degree.count(todayQuery),
      req.models.Degree.count(thisWeekQuery),
      req.models.Degree.count(thisMonthQuery),
      req.models.Degree.count()
    ])
    .spread(function (todayItems, thisWeekItems, thisMonthItems, totalItems) {
      return res.json({
        today: todayItems,
        thisWeek: thisWeekItems,
        thisMonth: thisMonthItems,
        total: totalItems
      });
    })
};

exports.exportCsv = function(req, res) {
  return exportItem(req.params.id, 'degree', false, req.models)
  .then(function(data) {
    res.set('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment;filename*=UTF-8\'\''+ data.item.name + '.csv');
    res.send(data.csv);
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send(err);
  });
};

exports.exportXls = function(req, res) {
  return exportItem(req.params.id, 'degree', true, req.models)
  .then(function(data) {
    res.xls(data.item.name + '.xlsx', data.json);
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send(err);
  });
};

// HELPER METHODS

var populateDegree = function populateDegree(degree, data, currentUser) {
  degree.name = data.name;
  degree.normalized = data.name.toLowerCase();
  degree.introVideo = data.introVideo;
  degree.shortDescription = data.shortDescription;
  degree.longDescription = data.longDescription;
  degree.goals = data.goals;
  degree.assessmentDescription = data.assessmentDescription;
  degree.assessmentSecondaryEvidence = data.assessmentSecondaryEvidence;
  degree.private = data.private;
  degree.published = !!data.published;
  degree.code = data.code;
  
  if (data.projects) {
    degree.projects = data.projects.map(function (project) {
      return mongoose.Types.ObjectId(project._id || project);
    });
  }

  if (data.components) {
    degree.components = data.components.map(function (component) {
      return mongoose.Types.ObjectId(component._id);
    });
  }

  if (data.prerequisites) {
    degree.prerequisites = data.prerequisites.map(function (prerequisite) {
      return mongoose.Types.ObjectId(prerequisite._id);
    });
  }

  if (data.relatedDegrees) {
    degree.relatedDegrees = data.relatedDegrees.map(function (relatedDegree) {
      return mongoose.Types.ObjectId(relatedDegree._id);
    });
  }

  degree.author = degree.author || currentUser._id;

  return degree;
};