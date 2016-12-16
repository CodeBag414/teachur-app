// Load required packages
var mongoose = require('mongoose');
var Promise = require('bluebird');
var moment = require('moment');
var fs = require('fs');
var countComponents = require('../lib/countComponents');
var _ = require('lodash');
var exportItem = require('../lib/exportItem');

// POST /api/courses
exports.create = function (req, res) {
  var currentUser = req.user;
  var course = new req.models.Course();
  var data = req.body;

  course = populateCourse(course, data, currentUser);
  
  if (data.image) {
    course.image = data.image._id;
  }

  return req.models.Keyword.updateKeywords(data.keywords)
  .then(function(keywords) {
    course.keywords = keywords;
    course.save(function (err) {
      if (err)
        return res.send(err);

      currentUser.addToMyModules(course, 'course', function () {
        res.json(course);
      });
    });
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });
};

// PUT /api/courses/:id
exports.update = function (req, res) {
  var currentUser = req.user;
  var data = req.body;

  req.models.Course.findById(req.params.id, function (err, course) {

    if (!course) {
      return res.status(404).send('Not found').end();
    }

    if (currentUser._id.equals(course.author) || currentUser.admin) {
      course = populateCourse(course, data, currentUser);
      return req.models.Keyword.updateKeywords(data.keywords)
      .then(function(keywords) {
        course.keywords = keywords;
        
        course.save(function (err) {
          if (err)
            return res.send(err);

          req.models.Course.findById(req.params.id).deepPopulate('projects projects.author projects.files projects.files.author author relatedCourses prerequisites components image keywords relatedCourses.image prerequisites.image').exec(function (err, course) {
            if (err)
              return res.send(err);

            res.json(course);
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

// GET /api/courses/:id
exports.getOne = function (req, res) {
  req.models.Course.findById(req.params.id).deepPopulate('projects projects.author projects.files projects.files.author author relatedCourses prerequisites components image keywords relatedCourses.image prerequisites.image components.assessments.files components.components.assessments.files components.assessments.author components.components.assessments.author').exec(function (err, course) {
    if (err)
      return res.send(err);

    if (!course) {
      return res.status(404).send('Not found').end();
    }

    res.json(course);
  });
};

// GET /api/courses
exports.getAll = function (req, res) {
  var authorId = req.user ? req.user._id : false;
  var limit = req.query.limit || 50;
  var skip = (req.query.page - 1) * req.query.limit;
  var query = {$or: [{published: true, private: false}, {author: authorId}]};

  if (!authorId) {
    query = {$or: [{published: true, private: false}]};
  }

  req.models.Course.find(query).limit(limit).skip(skip).populate('author relatedCourses prerequisites components image').exec(function (err, courses) {
    if (err)
      return res.send(err);

    res.json(courses);
  });
};

exports.getAllByAuthor = function (req, res) {
  var authorId = req.user._id;
  var limit = req.query.limit || 21;
  var page = req.query.page || 1;
  var skip = (page - 1) * limit;

  req.models.Course
  .find({author: authorId})
  .limit(limit)
  .skip(skip)
  .populate('author relatedCourses prerequisites components image').exec(function (err, courses) {
    if (err)
      return res.send(err);

    res.json(courses);
  });
};

// GET /api/courses/:id/current-use
exports.getCurrentUse = function (req, res) {
  var itemId = req.params.id;
  var currentUse = {};

  req.models.Degree.find({
    components: itemId
  }).distinct('_id').exec(function (err, degreesIds) {

    req.models.Degree
      .find({
        _id: {$in: degreesIds}
      })
      .deepPopulate('author relatedDegrees prerequisites components components.image')
      .then(function(degrees) {
        currentUse.degrees = degrees;
        res.json(currentUse);
      });
  });
};

exports.delete = function (req, res) {
  var itemId = req.params.id;

  req.models.Course.findById(req.params.id).exec(function (err, item) {
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

    req.models.Course.count(query).exec(function (err, count) {

      if (!limit) {
        limit = count <= 100 ? count : 100;
      }

      req.models.Course.find(query).populate(isPopulated === 1 ? 'author relatedCourses prerequisites components image' : 'author relatedCourses prerequisites components').limit(limit).skip(skip).sort(order).exec(function (err, items) {
        if (err)
          return res.send(err);

        if (admin) {
          return Promise.each(items, function(item, i) {
            return countComponents(item._id, 'course', req.models)
            .then(function(result) {
              item.statistics = result;
              return items[i] = item;
            })
          })
          .then(function() {
            return res.json({items: items, count: count});
          });
        }

        res.json({items: items, count: count});
      });
    });
  } else {

    query = admin ? {name: searchText} : {
      published: true,
      $and: [{$or: [{private: false}, {private: null}]}, {$or: [{shortDescription: searchText}, {longDescription: searchText}]}]
    };

    req.models.Course.count(query).exec(function (err, count) {

      if (!limit) {
        limit = count <= 100 ? count : 100;
      }

      req.models.Course.find(query).populate(isPopulated === 1 ? 'author relatedCourses prerequisites components image' : 'author relatedCourses prerequisites components').limit(limit).skip(skip).sort(order).exec(function (err, items) {
        if (err)
          return res.send(err);

        if (admin) {
          return Promise.each(items, function(item, i) {
            return countComponents(item._id, 'course', req.models)
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

exports.getStatistics = function (req, res) {
  var todayStart = moment().startOf('day').format();
  var thisWeekStart = moment().startOf('isoweek').format();
  var thisMonthStart = moment().startOf('month').format();

  var todayQuery = {createdAt: {$gt: todayStart}};
  var thisWeekQuery = {createdAt: {$gt: thisWeekStart}};
  var thisMonthQuery = {createdAt: {$gt: thisMonthStart}};

  return Promise.all([
      req.models.Course.count(todayQuery),
      req.models.Course.count(thisWeekQuery),
      req.models.Course.count(thisMonthQuery),
      req.models.Course.count()
    ])
    .spread(function (todayItems, thisWeekItems, thisMonthItems, totalItems) {
      return res.json({
        today: todayItems,
        thisWeek: thisWeekItems,
        thisMonth: thisMonthItems,
        total: totalItems
      });
    });
};

exports.exportCsv = function(req, res) {
  return exportItem(req.params.id, 'course', false, req.models)
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
  return exportItem(req.params.id, 'course', true, req.models)
  .then(function(data) {
    res.xls(data.item.name + '.xlsx', data.json);
  })
  .catch(function(err) {
    console.error(err);
    res.status(500).send(err);
  });
};

// HELPER METHODS

var populateCourse = function populateCourse(course, data, currentUser) {
  course.name = data.name;
  course.normalized = data.name.toLowerCase();
  course.introVideo = data.introVideo;
  course.shortDescription = data.shortDescription;
  course.longDescription = data.longDescription;
  course.goals = data.goals;
  course.assessmentDescription = data.assessmentDescription;
  course.assessmentSecondaryEvidence = data.assessmentSecondaryEvidence;
  course.private = data.private;
  course.published = !!data.published;
  course.suggestedTexts = data.suggestedTexts;
  course.code = data.code;

  if (data.projects) {
    course.projects = data.projects.map(function (project) {
      return mongoose.Types.ObjectId(project._id);
    });
  }

  if (data.components) {
    course.components = data.components.map(function (component) {
      return mongoose.Types.ObjectId(component._id);
    });
  }

  if (data.prerequisites) {
    course.prerequisites = data.prerequisites.map(function (prerequisite) {
      return mongoose.Types.ObjectId(prerequisite._id);
    });
  }


  if (data.relatedCourses) {
    course.relatedCourses = data.relatedCourses.map(function (relatedCourse) {
      return mongoose.Types.ObjectId(relatedCourse._id);
    });
  }

  course.author = course.author || currentUser._id;

  return course;
}