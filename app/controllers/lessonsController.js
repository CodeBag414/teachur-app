// Load required packages
var mongoose = require('mongoose');
var Promise = require('bluebird');
var moment = require('moment');
var countComponents = require('../lib/countComponents');
var _ = require('lodash');

// POST /api/lessons
exports.create = function (req, res) {
  var currentUser = req.user;
  var lesson = new req.models.Lesson();
  var data = req.body;

  lesson = populateLesson(lesson, data, currentUser);

  return req.models.Keyword.updateKeywords(data.keywords)
  .then(function(keywords) {
    lesson.keywords = keywords;

    lesson.save(function (err) {
      if (err)
        return res.send(err);

      currentUser.addToMyModules(lesson, 'lesson', function () {
        res.json(lesson);
      });
    });
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });
};

// PUT /api/lessons
exports.update = function (req, res) {
  var currentUser = req.user;
  var data = req.body;

  req.models.Lesson.findById(req.params.id, function (err, lesson) {

    if (!lesson) {
      return res.status(404).send('Not found').end();
    }

    if (currentUser._id.equals(lesson.author) || currentUser.admin) {
      lesson = populateLesson(lesson, data, currentUser);
      return req.models.Keyword.updateKeywords(data.keywords)
      .then(function(keywords) {
        lesson.keywords = keywords;

        lesson.save(function (err) {
          if (err)
            return res.send(err);

          req.models.Lesson.findById(req.params.id).deepPopulate('author relatedLessons prerequisites components projects projects.author projects.files projects.files.author keywords').exec(function (err, lesson) {
            if (err)
              return res.send(err);

            res.json(lesson);
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

// GET /api/lessons/:id
exports.getOne = function (req, res) {
  req.models.Lesson.findById(req.params.id).deepPopulate('author relatedLessons prerequisites components projects projects.author projects.files projects.files.author keywords components.assessments.files components.assessments.author').exec(function (err, lesson) {
    if (err)
      return res.send(err);

    if (!lesson) {
      return res.status(404).send('Not found').end();
    }

    res.json(lesson);
  });
};

// GET /api/lessons
exports.getAll = function (req, res) {
  var authorId = req.user ? req.user._id : false;
  var results = {};

  var limit = req.query.limit || 100;
  var skip = (req.query.page - 1) * req.query.limit;

  var query = {$or: [{published: true, private: false}, {author: authorId}]};

  if (!authorId) {
    query = {$or: [{published: true, private: false}]};
  }

  req.models.Lesson.count(query).exec(function (err, count) {
    if (err)
      return res.send(err);

    results.count = count;

    req.models.Lesson.find(query).limit(limit).skip(skip).populate('components').exec(function (err, lessons) {
      if (err)
        return res.send(err);

      results.items = lessons;
      res.json(results);
    });
  });
};

exports.getAllByAuthor = function (req, res) {
  var authorId = req.user._id;
  var limit = req.query.limit || 21;
  var page = req.query.page || 1;
  var skip = (page - 1) * limit;

  req.models.Lesson
  .find({author: authorId})
  .limit(limit)
  .skip(skip)
  .populate('author relatedLessons prerequisites components')
  .exec(function (err, lessons) {
    if (err)
      return res.send(err);

    res.json(lessons);
  });
};

// GET /api/lessons/:id/current-use
exports.getCurrentUse = function (req, res) {
  var itemId = req.params.id;
  var currentUse = {};

  req.models.Course.find({
    components: itemId
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
};

exports.delete = function (req, res) {
  var itemId = req.params.id;
  var currentUser = req.user;
  req.models.Lesson.findById(req.params.id).exec(function (err, item) {
    if (err)
      return res.send(err);

    if (!item) {
      return res.status(404).send('Not found').end();
    }

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

  if (searchByTitle === 1) {
    var query = {
      name: searchText,
      published: true,
      $or: [{private: false}, {private: null}]
    };

    if (admin) {
      query = {
        name: searchText
      };
    }

    req.models.Lesson.count(query).exec(function (err, count) {

      if (!limit) {
        limit = count <= 100 ? count : 100;
      }

      req.models.Lesson.find(query).limit(limit).skip(skip).sort(order).exec(function (err, items) {
        if (err)
          return res.send(err);

        res.json({items: items, count: count});
      });
    });
  } else {
    var query = {
      published: true,
      $and: [{$or: [{private: false}, {private: null}]}, {$or: [{shortDescription: searchText}, {longDescription: searchText}]}]
    };

    if (admin) {
      query = {
        $or: [{shortDescription: searchText}, {longDescription: searchText}]
      };
    }

    req.models.Lesson.count(query).exec(function (err, count) {

      if (!limit) {
        limit = count <= 100 ? count : 100;
      }

      req.models.Lesson.find(query).populate('author').limit(limit).skip(skip).sort(order).exec(function (err, items) {
        if (err)
          return res.send(err);

        if (admin) {
          return Promise.each(items, function(item, i) {
            return countComponents(item._id, 'lesson', req.models)
            .then(function(result) {
              item.statistics = result;
              return items[i] = item;
            })
          })
          .then(function() {
            return res.json({items: items, count: count});
          });
        }

        return res.json({items: items, count: count});
      });
    });
  }

};

exports.getStatistics = function (req, res) {
  var todayStart = moment().startOf('day').format();
  var thisWeekStart = moment().startOf('isoweek').format();
  var thisMonthStart = moment().startOf('month').format();

  var todayQuery = {createdAt: { $gt: todayStart }};
  var thisWeekQuery = {createdAt: { $gt: thisWeekStart }};
  var thisMonthQuery = {createdAt: { $gt: thisMonthStart }};

  return Promise.all([
    req.models.Lesson.count(todayQuery),
    req.models.Lesson.count(thisWeekQuery),
    req.models.Lesson.count(thisMonthQuery),
    req.models.Lesson.count()
  ])
  .spread(function(todayItems, thisWeekItems, thisMonthItems, totalItems) {
    return res.json({
      today: todayItems,
      thisWeek: thisWeekItems,
      thisMonth: thisMonthItems,
      total: totalItems
    });
  })
};

// HELPER METHODS

var populateLesson = function populateLesson(lesson, data, currentUser) {
  lesson.name = data.name;
  lesson.normalized = data.name.toLowerCase();
  lesson.shortDescription = data.shortDescription;
  lesson.introVideo = data.introVideo;
  lesson.longDescription = data.longDescription;
  lesson.assessmentDescription = data.assessmentDescription;
  lesson.assessmentSecondaryEvidence = data.assessmentSecondaryEvidence;
  lesson.private = data.private;
  lesson.published = !!data.published;
  lesson.code = data.code;
  
  if (data.projects) {
    lesson.projects = data.projects.map(function (project) {
      return mongoose.Types.ObjectId(project._id || project);
    });
  }

  if (data.components) {
    lesson.components = data.components.map(function (component) {
      return mongoose.Types.ObjectId(component._id);
    });
  }

  if (data.prerequisites) {
    lesson.prerequisites = data.prerequisites.map(function (prerequisite) {
      return mongoose.Types.ObjectId(prerequisite._id);
    });
  }

  if (data.relatedLessons) {
    lesson.relatedLessons = data.relatedLessons.map(function (relatedLesson) {
      return mongoose.Types.ObjectId(relatedLesson._id);
    });
  }

  lesson.author = lesson.author || currentUser._id;

  return lesson;
};