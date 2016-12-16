var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');

var keywordSchema = mongoose.Schema({
  text: String
});


keywordSchema.statics.updateKeywords = Promise.method(function updateKeywords(keywords) {
  var _this = this;
  var promises = [];

  if (!keywords) {
    return Promise.resolve([]);
  }

  keywords.forEach(function(keyword) {
    if (keyword._id) {
      return promises.push(new Promise.resolve(keyword));
    }

    return promises.push(_this.create(keyword));
  });

  return Promise.all(promises).then(function(keywords) {
    return _.map(keywords, '_id');
  });
});

module.exports = mongoose.model('Keyword', keywordSchema);