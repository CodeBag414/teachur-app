var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

var Objective = require('../models/objective');
var Lesson = require('../models/lesson');
var Course = require('../models/course');
var Degree = require('../models/degree');

var f = {
  degree_name: {
    index: 0
  },
  course_name: {
    index: 1
  },
  course_description_short: {
    index: 2
  },
  course_description_long: {
    index: 3
  },
  lesson_name: {
    index: 4
  },
  lesson_short: {
    index: 5
  },
  lesson_goals: {
    index: 6
  },
  objective_name: {
    index: 7
  },
  objective_short_description: {
    index: 8
  }
}

exports.seedData = function(req, res) {
  var inputFile = 'seedData.csv';

  var parser = parse({delimiter: ','}, function (err, data) {
    async.eachSeries(data, function (line, callback) {
      
      if (line[0] === 'degree_name') {

        callback();

      } else {

        var degreeName = line[f.degree_name.index];

        createDegree(degreeName, function(degree) {

          var courseData = {
            name: line[f.course_name.index],
            shortDescription: line[f.course_description_short.index],
            longDescription: line[f.course_description_long.index],
            private: false,
            published: true
          }

          createCourse(courseData, degree, function(course) {

            var lessonData = {
              name: line[f.lesson_name.index],
              shortDescription: line[f.lesson_short.index],
              goals: line[f.lesson_goals.index],
              private: false,
              published: true
            }

            createLesson(lessonData, course, function(lesson) {
              var objectiveData = {
                name: line[f.objective_name.index],
                shortDescription: line[f.objective_short_description.index],
                private: false,
                published: true
              }

              createObjective(objectiveData, lesson, function(objective) {
                callback();
              });

            });
          });
        });

      }
      
    }, function(err) {
      res.json({success: true});
    });
  });

  fs.createReadStream(inputFile).pipe(parser);
};

function createDegree(degreeName, cb) {
  Degree.findOne({name: degreeName}).exec(function(err, degree) {
    console.log(degree)
    if (!degree) {
      Degree.create({name: degreeName, private: false, published: true}, function(err, degree) {
        cb(degree);
      });
    } else {
      cb(degree);
    }
  });
}

function createCourse(courseData, degree, cb) {
  Course.findOne({name: courseData.name}).exec(function(err, course) {
    if (!course) {
      Course.create(courseData, function(err, course) {
        degree.components.push(course._id);
        degree.save(function() {
          cb(degree)
        });
      });
    } else {
      cb(course);
    }
  });
}

function createLesson(lessonData, course, cb) {
  Lesson.findOne({name: lessonData.name}).exec(function(err, lesson) {
    if (!lesson) {
      Lesson.create(lessonData, function(err, lesson) {
        course.components.push(lesson._id);
        course.save(function() {
          cb(lesson)
        });
      });
    } else {
      cb(lesson);
    }
  });
}

function createObjective(objectiveData, lesson, cb) {
  Objective.findOne({name: objectiveData.name}).exec(function(err, objective) {
    if (!objective) {
      Objective.create(objectiveData, function(err, objective) {
        lesson.components.push(objective._id);
        lesson.save(function() {
          cb(objective)
        });
      });
    } else {
      cb(objective);
    }
  });
}

