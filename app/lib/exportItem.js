var json2csv = require('json2csv');
var json2xls = require('json2xls');
var Promise = require('bluebird');
var ModelMap = require('../lib/modelMap');
var modelMap = new ModelMap();
var _ = require('lodash');

var exportItem = function(itemId, itemName, excel, models) {
  modelMap.init(models);
  
  if (itemName === 'degree') {
    var fields = ['name', 'goal', 'course', 'courseGoal', 'lesson', 'objective'];
    var fieldNames = ['Degree name', 'Degree aims', 'Course name', 'Course goals', 'Course lessons', 'Objectives'];
    var populate = 'components components.components components.components.components';
  } else {
    var fields = ['name', 'goal', 'lesson', 'objective'];
    var fieldNames = ['Course name', 'Course goals', 'Course lessons', 'Objectives'];
    var populate = 'components components.components'
  }

  return new Promise(function(resolve, reject) {
    return modelMap[itemName]
    .findById(itemId)
    .deepPopulate(populate)
    .exec()
    .then(function(item) {
      var data = prepareData(item, itemName);
      if (!excel) {
        return buildCsv(fields, data, fieldNames)
        .then(function(csv) {
          return resolve({ csv: csv, item: item });
        });
      }

      return resolve({ json: data, item: item });
    }, function(err) {
      return reject(err);
    });
  });
};

function buildCsv(fields, data, fieldNames) {
  return new Promise(function(resolve, reject) {
    json2csv({ data: data, fields: fields, fieldNames: fieldNames, del: '\t' }, function(err, csv) {
      if (err) {
        return reject(err);
      }
      return resolve(csv);
    });
  });
};

function buildXls(fields, data, fieldNames) {
  return new Promise(function(resolve, reject) {
    var xls = json2xls(data);
    return resolve(xls);
  });
};

function prepareData(rawData, itemName) {
  var data = [];
  var name = rawData.name;
  try {
    data.push({ name: name, goal: 'No goals'});
    rawData.goals.forEach(function(goal, i) {
      if (data[i]) {
        data[i].goal = goal;
      } else  {
        data.push({name: i == 0 ? name : '', goal: goal});
      }
    });

  
    if (itemName === 'degree') {
      data = addCoursesData(rawData, data, itemName);
    } else {
      data = addLessonsData(rawData.components, data, itemName);
    }
  } catch(err) {
    console.dir(err, {depth: 6});
    throw new Error(err);
  }

  return data;
};

function addCoursesData(rawData, data, itemName) {
  var relativeCount = 0;
  rawData.components.forEach(function(component, i) {
    if (data.length > i + relativeCount) {
      data[relativeCount + i].course = i === 0 ? component.name : '';
    } else {
      data.push({name: '', goal:'', course: component.name});
    }

    component.goals.forEach(function(goal, j) {
      if (data.length > j + relativeCount) {
        data[relativeCount + j].courseGoal = goal;
      } else {
        data.push({name: '', goal:'', course: '', courseGoal: goal});
      }
    });

    if (component.goals.length === 0) {
      data[0].courseGoal = 'No goals';
    }

    data = addLessonsData(component.components, data, itemName);
    relativeCount = data.length - 1;
  });

  return data;
}

function addLessonsData(lessonsData, data, itemName) {
  var relativeCount = data.length - 1;
  var pushObject = itemName === 'degree' ? { name: '', goal:'', course: '', courseGoal: '' } : { name: '', goal:'' };

  lessonsData.forEach(function(lesson, i) {
    if (data.length > i + relativeCount) {
      data[relativeCount + i].lesson = lesson.name;
      data[relativeCount + i].objective = '';
    } else {
      var po = _.clone(pushObject);
      po['lesson'] = lesson.name;
      po['objective'] = '';
      data.push(po);
    }

    lesson.components.forEach(function(objective, j) {
      if (data.length > j + relativeCount) {
        data[relativeCount + j].objective = objective.name;
      } else {
        var po = _.clone(pushObject);
        po['lesson'] = '';
        po['objective'] = objective.name;
        data.push(po);
      }
    });

    relativeCount = data.length;
  });

  return data;
}

module.exports = exportItem;