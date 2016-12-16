var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');

var fileSchema = mongoose.Schema({
  name: String,
  url: String,
  external: Boolean,
  contentType: String,
  size: String,
  dimensions: String,
  pid: String,
  type: String,
  description: String,
  author: {type: mongoose.Schema.ObjectId, ref: 'User'}
});

fileSchema.statics.updateFiles = Promise.method(function updateFiles(itemFiles, files, currentUser) {
  var _this = this;
  var promises = [];

  if (!files) {
    return Promise.resolve([]);
  }

  files.forEach(function(file) {
    if (file.newFile) {
      return false;
    }

    if (file && file._id) {
      return promises.push(_this.updateFile(itemFiles, file));
    }

    return promises.push(_this.addNewFile(file, currentUser));
  });

  return Promise.all(promises);
});

fileSchema.statics.updateFile = Promise.method(function updateFile(files, file) {
  var _this = this;

  if (!file) {
    return false;
  }

  var oldFile = _.find(files, function(o) {
    return file._id === o._id.toHexString();
  });

  if (oldFile && file) {
    oldFile.url = file.url;
    oldFile.external = file.external;
    oldFile.description = file.description;
    oldFile.name = file.name;
    return oldFile.save().then(function(file) {
      return oldFile;
    })
  }

  return false;
});

fileSchema.statics.addNewFile = Promise.method(function addNewFile(file, currentUser) {
  var _this = this;

  if (!file) {
    return false;
  }

  var newFile = new _this();
  newFile.url = file.url;
  newFile.name = file.name;
  newFile.description = file.description;
  newFile.author = currentUser._id;
  newFile.external = true;

  return newFile.save().then(function(newFile) {
    return newFile;
  });
});

module.exports = mongoose.model('File', fileSchema);