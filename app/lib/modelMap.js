var Objective = require('../models/objective');
var Lesson = require('../models/lesson');
var Course = require('../models/course');
var Degree = require('../models/degree');
var Assessment = require('../models/assessment');

function ModelMap() {
  this.objective = Objective;
  this.lesson = Lesson;
  this.course = Course;
  this.degree = Degree;
  this.assessment = Assessment;

  this.init = function(models) {
    this.objective = models.Objective;
    this.lesson = models.Lesson;
    this.course = models.Course;
    this.degree = models.Degree;
    this.assessment = models.Assessment;
  };
};

module.exports = ModelMap;
