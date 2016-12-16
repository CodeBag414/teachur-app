var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var projectsSchema = mongoose.Schema({
  description: String,
  link: String,
  files: [
    { type: mongoose.Schema.ObjectId, ref: 'File' }
  ],
  author: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, {timestamps: true});

projectsSchema.methods.updateFiles = Promise.method(function(files, currentUser, File) {
  var project = this;

  return File.updateFiles(project.files, files, currentUser).then(function(files) {
    project.files = _.map(files, '_id');
    return project.save();
  });
});

projectsSchema.plugin(deepPopulate);

module.exports = mongoose.model('Project', projectsSchema);
