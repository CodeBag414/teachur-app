var _ = require('lodash');

function getItemAssessments(course, user) {
  
  if (!course.components) {
    return [];
  }

  return getAssessments(course, user);
};

function getAssessments(course, user) {
  var assessments = [];
  
  _.forEach(course.components, function(lesson) {

    if (_.isArray(lesson.components)) {

      _.forEach(lesson.components, function(objective) {

        var testedIndex = _.findIndex(user.testedObjectives, function(testedObjectiveId) {
          return testedObjectiveId.toString() === objective._id.toString();
        });

        if (!_.isEmpty(objective.assessments) && testedIndex === -1) {
          var validAssessments = _.filter(objective.assessments, function(assessment) {
            return assessment.type === 'multipleChoice';
          });

          assessments.push(_.sample(validAssessments));
        }
      });

      
    }

  });

  return assessments;
}

module.exports = getItemAssessments;
