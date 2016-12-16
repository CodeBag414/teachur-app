var _ = require('lodash');

var ModelMap = require('../lib/modelMap');
var modelMap = new ModelMap();

var countComponents = function(id, modelName, models) {
  modelMap.init(models);

  return modelMap[modelName].findOne({_id: id}).deepPopulate('components._id components.components._id components.components.components._id').then(function(item) {
    return buildReturnObject(item, modelName);
  });
};

function buildReturnObject(item, modelName) {
  var componentsOfComponents = [];
  var componentsOfComponentsOfComponents = [];
  var result = {
    componentsCount: item.components.length
  };

  item.components.forEach(function(c) {
    componentsOfComponents = _.union(componentsOfComponents, _.map(c.components, '_id'));
    if (c.components) {
      c.components.forEach(function(co) {
        componentsOfComponentsOfComponents = _.union(componentsOfComponentsOfComponents, _.map(co.components, '_id'));
      })
    }
  });

  if (modelName === 'degree') {
    result.nestedNestedComponentsCount = componentsOfComponentsOfComponents.length;
  };

  if (modelName === 'course' || modelName === 'degree') {
    result.nestedComponentsCount = componentsOfComponents.length;
  };

  return result;
}

module.exports = countComponents;
