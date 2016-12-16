var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
  fileName: String,
  url: String,
  contentType: String,
  size: String,
  dimensions: String,
  pid: String,
  thumbnailUrl: String
});

module.exports = mongoose.model('Image', imageSchema);