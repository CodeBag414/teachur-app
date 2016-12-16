var _ = require('lodash');

function getItemAssessments(item) {
  
  if (!item.components) {
    return {};
  }

  return getAssessments(item);
};

function getAssessments(item) {
  var assessments = [];
  
  _.forEach(item.components, function(component) {

    if (!assessments[0]) {
      assessments.push({});
    }

    assessments[0][component._id] = component.assessments;

    if (_.isArray(component.components)) {
      if (!assessments[1]) {
        assessments.push({});
      }

      _.forEach(component.components, function(c) {
        assessments[1][c._id] = c.assessments;

        if (_.isArray(c.components)) {
          if (!assessments[2]) {
            assessments.push({});
          }

          _.forEach(c.components, function(cc) {
            assessments[2][cc._id] = cc.assessments;
          });
        }

      });
    }

  });

  return assessments;
}

module.exports = getItemAssessments;