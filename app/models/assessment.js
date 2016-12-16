var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var assessmentSchema = mongoose.Schema({
  type: String,
  question: String,
  answers: [],
  files: [
    { type: mongoose.Schema.ObjectId, ref: 'File' }
  ],
  author: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {timestamps: true});

assessmentSchema.methods.updateFiles = Promise.method(function(files, currentUser, File) {
  var assessment = this;

  return File.updateFiles(assessment.files, files, currentUser).then(function(files) {
    assessment.files = _.map(files, '_id');
    return assessment.save();
  });
});

assessmentSchema.plugin(deepPopulate);

module.exports = mongoose.model('Assessment', assessmentSchema);
