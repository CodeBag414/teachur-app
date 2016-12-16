// Load required packages
var mongoose = require('mongoose');
var Promise = require('bluebird');
var moment = require('moment');
var _ = require('lodash');

// POST /api/objectives
exports.create = function (req, res) {
  var currentUser = req.user;
  var objective = new req.models.Objective();
  var data = req.body;

  objective = populateObjective(objective, data, currentUser);
  
  data.recommendedMedia = _.map(data.recommendedMedia, function(rm) {
    return _.omit(rm, '_id');
  });

  objective.updateRecommendedMedia(data.recommendedMedia, currentUser, req.models.File)
  .then(function() {
    return req.models.Keyword.updateKeywords(data.keywords);
  })
  .then(function(keywords) {
    objective.keywords = keywords;
    objective.save(function (err) {
      if (err)
        return res.send(err);

      currentUser.addToMyModules(objective, 'objective', function () {
        res.json(objective);
      });
    });
  });
};

// PUT /api/objectives
exports.update = function (req, res) {
  var currentUser = req.user;
  var data = req.body;

  req.models.Objective.findById(req.params.id).populate('recommendedMedia').exec(function (err, objective) {

    if (err) {
      return res.send(err).end();
    }

    if (!objective) {
      return res.status(404).send('Not found').end();
    }

    if (currentUser._id.equals(objective.author) || currentUser.admin) {
      objective = populateObjective(objective, data, currentUser);
      objective.updateRecommendedMedia(data.recommendedMedia, currentUser, req.models.File)
      .then(function() {
        return req.models.Keyword.updateKeywords(data.keywords);
      })
      .then(function(keywords) {
        objective.keywords = keywords;

        objective.save(function (err) {
          if (err)
            return res.send(err);

            req.models.Objective.findById(req.params.id).deepPopulate('author relatedObjectives prerequisites assessments assessments.author assessments.files assessments.files.author recommendedMedia.author keywords').exec(function (err, objective) {
              if (err)
                return res.send(err);

              res.json(objective);
            });
        });

      });
    } else {
      res.status(403).send('Forbidden');
    }

  });
};

// GET /api/objectives/:id
exports.getOne = function (req, res) {
  req.models.Objective.findById(req.params.id).deepPopulate('author relatedObjectives prerequisites assessments assessments.author assessments.files assessments.files.author recommendedMedia.author keywords').exec(function (err, objective) {
    if (err)
      return res.send(err);

    if (!objective) {
      return res.status(404).send('Not found');
    }

    res.json(objective);
  });
};

// GET /api/objectives
exports.getAll = function (req, res) {
  var authorId = req.user ? req.user._id : false;
  var results = {};

  var limit = req.query.limit || 100;
  var skip = (req.query.page - 1) * req.query.limit;

  var query = {$or: [{published: true, private: false}, {author: authorId}]};

  if (!authorId) {
    query = {$or: [{published: true, private: false}]};
  }

  req.models.Objective.count(query).exec(function (err, count) {
    if (err)
      return res.send(err);

    results.count = count;

    req.models.Objective.find(query).limit(limit).skip(skip).exec(function (err, objectives) {
      if (err)
        return res.send(err);

      results.items = objectives;
      res.json(results);
    });
  });

};

exports.getAllByAuthor = function (req, res) {
  var authorId = req.user._id;
  var limit = req.query.limit || 21;
  var page = req.query.page || 1;
  var skip = (page - 1) * limit;

  req.models.Objective
  .find({author: authorId})
  .limit(limit)
  .skip(skip)
  .populate('author relatedObjectives prerequisites')
  .exec(function (err, objectives) {
    if (err)
      return res.send(err);

    res.json(objectives);
  });
};

// GET /api/objectives/:id/current-use
exports.getCurrentUse = function (req, res) {
  var objectiveId = req.params.id;
  var currentUse = {
    objectives: [],
    lessons: []
  };

  req.models.Lesson.find({
    components: objectiveId
  }).exec(function (err, lessons) {
    if (err)
      return res.send(err);

    currentUse.lessons = lessons;

    req.models.Course.find({
      components: {$in: lessons}
    }).distinct('_id').exec(function (err, coursesIds) {
      if (err)
        return res.send(err);

      req.models.Course.find({
        _id: {$in: coursesIds}
      }).populate('image').exec(function (err, courses) {

        currentUse.courses = courses;

        req.models.Degree.find({
          components: {$in: courses}
        }).distinct('_id').exec(function (err, degreesIds) {

          req.models.Degree.find({
            _id: {$in: degreesIds}
          }).deepPopulate('components.image').exec(function (err, degrees) {
            if (err)
              return res.send(err);

            currentUse.degrees = degrees;

            res.json(currentUse);

          });

        });

      });

    });

  });
};

exports.delete = function (req, res) {
  var itemId = req.params.id;

  req.models.Objective.findById(req.params.id).exec(function (err, item) {
    if (err)
      return res.send(err).end();

    if (!item) {
      res.status(404).send('Not found').end();
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

  var query = {
    name: {$regex: searchText},
    published: true,
    $or: [{private: false}, {private: null}]
  };

  if (admin) {
    query = {
      name: {$regex: searchText}
    };
  }

  req.models.Objective.count(query).exec(function (err, count) {

    if (!limit) {
      limit = count <= 100 ? count : 100;
    }

    req.models.Objective.find(query).populate('author').limit(limit).skip(skip).sort(order).exec(function (err, items) {
      if (err)
        return res.send(err);

      res.json({items: items, count: count});
    });
  });

};

exports.getStatistics = function (req, res) {
  var todayStart = moment().startOf('day').format();
  var thisWeekStart = moment().startOf('isoweek').format();
  var thisMonthStart = moment().startOf('month').format();

  var todayQuery = {createdAt: {$gt: todayStart}};
  var thisWeekQuery = {createdAt: {$gt: thisWeekStart}};
  var thisMonthQuery = {createdAt: {$gt: thisMonthStart}};

  return Promise.all([
      req.models.Objective.count(todayQuery),
      req.models.Objective.count(thisWeekQuery),
      req.models.Objective.count(thisMonthQuery),
      req.models.Objective.count()
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

// HELPER METHODS

var populateObjective = function populateObjective(objective, data, currentUser) {
  objective.name = data.name;
  objective.normalized = data.name.toLowerCase();
  objective.longDescription = data.longDescription;
  objective.assessmentDescription = data.assessmentDescription;
  objective.assessmentSecondaryEvidence = data.assessmentSecondaryEvidence;
  objective.private = data.private;
  objective.published = !!data.published;
  objective.code = data.code;

  if (data.prerequisites) {
    objective.prerequisites = data.prerequisites.map(function (prerequisite) {
      return mongoose.Types.ObjectId(prerequisite._id);
    });
  }

  if (data.relatedObjectives) {
    objective.relatedObjectives = data.relatedObjectives.map(function (relatedObjective) {
      return mongoose.Types.ObjectId(relatedObjective._id);
    });
  }

  if (data.assessments) {
    objective.assessments = data.assessments.map(function (assessment) {
      return mongoose.Types.ObjectId(assessment._id);
    });
  }

  objective.author = objective.author || currentUser._id;

  return objective;
};