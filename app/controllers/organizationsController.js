var _ = require('lodash');
var Promise = require('bluebird');
var ModelMap = require('../lib/modelMap');
var modelMap = new ModelMap();

exports.getAll = function(req, res) {
  var currentUser = req.user;
  var models = req.models;

  return models.Organization
  .find()
  .then(function(organizations) {
    return res.json(organizations);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.send(err);
  });

};

exports.create = function(req, res) {
  var data = req.body;
  var models = req.models;
  var organization;
  
  return models.Organization
  .create(data)
  .then(function(org) {
    organization = org;
    var organizationDb = req.db.get(organization);
    var wannabeUser = new organizationDb.WannabeUser();

    wannabeUser.email = organization.adminEmail;
    wannabeUser.organizationAdmin = true;

    return wannabeUser.save().then(function(wannabeUser) {
      return wannabeUser.grantAccess(organization);
    });
    
  })
  .then(function(wannabeUser) {
    return res.json(organization);
  }, function(err) {
    console.error(err.stack || err);
    return res.send(err);
  });
};

exports.searchMainContent = function(req, res) {
  var mainModels = req.db.get('main');
  var order = req.query.order || 'name';

  var searchText = new RegExp(req.query.search, 'i'),
    generateRegExp = function (text) {
      var wordsArr = text.split(' '),
        resultString = '/^';

      _.forEach(wordsArr, function (word, index) {
        resultString += "(?=.*\\b" + word + "\\b)";
      });

      return resultString;
    };

  var finalRegex = req.query.search.split(' ').length > 1 ? generateRegExp(req.query.search) : searchText;

  var query = {
    name: searchText,
    published: true,
    $or: [{private: false}, {private: null}]
  };

  return mainModels.Course.find(query).limit(10).sort(order).exec(function (err, items) {
    if (err)
      return res.send(err);

    return res.json(items);
  });
};

exports.copyMainContent = function(req, res) {
  var data = req.body;
  var models = req.models;
  modelMap.init(models);
  var mainModels = req.db.get('main');
  var originalCourse;

  return mainModels.Course
  .findById(data._id)
  .deepPopulate('croppedImage image assessments components components.components components.components.components')
  .then(function(course) {
    originalCourse = course;
    return copyItem(course, 'course', models);
  })
  .then(function(course) {
    return copyComponents(originalCourse, course, 'lesson', req);
  })
  .then(function(course) {
    course.author = req.user._id;
    return course.save();
  })
  .then(function(course) {
    return res.json(course);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.error(err);
  })
};

function copyComponents(originalItem, newItem, componentName, req) {
  return Promise.each(originalItem.components, function(component) {
    return copyItem(component, componentName, req.models)
    .then(function(newComponent) {
      newItem.components.push(newComponent._id);
      return newItem.save()
      .then(function() {
        if (componentName === 'lesson') {
          return copyComponents(component, newComponent, 'objective', req)
          .then(function(newComponentOfComponent) {
            newComponent.components.push(newComponentOfComponent._id);
            return newComponent.save();
          });
        }

        return newItem.save();
      });
    })
    .then(function() {
      return newItem.save();
    });
  })
  .then(function() {
    return newItem;
  });
};

function copyItem(item, itemName, models) {
  var newItem;
  var itemData = _.omit(item.toJSON(), ['_id', '__v', 'updatedAt', 'createdAt', 'croppedImage', 'image', 'assessments', 'components', 'components.components', 'author', 'prerequisites', 'relatedCourses', 'relatedLessons', 'keywords'])
  return modelMap[itemName]
  .create(itemData)
  .then(function(ni) {
    newItem = ni;
    return createAssessments(item.assessments, models);
  })
  .then(function(assessments) {
    return newItem.assessments = _.map(assessments, '_id');
  })
  .then(function() {
    if (item.image) {
      var imageData = _.omit(item.image.toJSON(), ['_id']);
      return models.Image.create(imageData);
    }

    return false;
  })
  .then(function(image) {
    if (image) {
      newItem.image = image._id;
      return newItem.save();
    }
    
    return newItem;
  });
};

function createAssessments(assessments, models) {
  return Promise.map(assessments, function(assessment) {
    var data = _.omit(assessment.toJSON(), ['_id', '__v']);
    return models.Assessment.create(data);
  });
};

