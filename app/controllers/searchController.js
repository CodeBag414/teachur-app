var Promise = require('bluebird');

exports.search = function (req, res) {
  var searchText = new RegExp(req.body.searchText, 'i');
  var response = {};

  req.models.Objective.find({name: searchText, published: true, private: false}, function (err, items) {
    response.objectives = items;

    req.models.Lesson.find({name: searchText, published: true, private: false}, function (err, items) {
      response.lessons = items;

      req.models.Course.find({name: searchText, published: true, private: false}, function (err, items) {
        response.courses = items;

        req.models.Degree.find({name: searchText, published: true, private: false}).populate({
          path: 'components',
          match: {image: {$exists: true}}
        }).exec(function (err, items) {
          Promise.map(items, function (degree) {
            return Promise.map(degree.components, function (component) {

              return req.models.Course.findById(component._id).populate('image').exec(function (course) {
                return course;
              });
            }).then(function (courses) {
              degree.components = courses;
              return degree;
            });
          }).then(function (degrees) {
            response.degrees = degrees;
            res.json(response);
          });
        });
      }).populate('image');
    });
  });
};