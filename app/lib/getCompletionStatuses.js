var _ = require('lodash');

var getCompletionStatuses = function(user) {
  try {
    var completionStatuses = {};

    _.forEach(user.enrolledDegrees, function(degree) {
      var completionStatus = getCompletionStatus(degree, 'degree', user.completedObjectives);
      completionStatuses[degree._id.toString()] = completionStatus;
    });


    _.forEach(user.enrolledCourses, function(course) {
      var completionStatus = getCompletionStatus(course, 'course', user.completedObjectives);
      completionStatuses[course._id.toString()] = completionStatus;
    });

    return completionStatuses;
  } catch(err) {
    console.error(err.stack || err);
    throw err;
  }
  
}

var getCompletionStatus = function(item, itemName, completedObjectives) {
  var itemObjectives = getObjectives(item, itemName);
  var completedObjectivesForItem = _.intersection(itemObjectives, _.map(completedObjectives, function(i) {
    return i._id.toString();
  }));

  var status = completedObjectivesForItem.length / itemObjectives.length;

  return _.round(status * 100, 0);
};

function getObjectives(item, itemName) {
  var objectives = [];

  if (!item.components) {
    return objectives;
  }

  item.components.forEach(function(c) {
    if (itemName === 'degree') {
      c.components.forEach(function (lesson) {
        objectives = _.union(objectives, _.map(lesson.components, function(i) {
          return i._id.toString();
        }));
      });
    } else {
      objectives = _.union(objectives, _.map(c.components, function(i) {
        return i._id.toString();
      }));
    }

  });

  return objectives;
}

module.exports = getCompletionStatuses;
