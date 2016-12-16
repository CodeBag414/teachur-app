var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var translate = require('../lib/translate');

var interestSchema = mongoose.Schema({
  en: String,
  es: String,
  zh: String,
  ja: String,
  pt: String,
  ru: String,
  hi: String,
  userCreated: { type: Boolean, default: false }
});

interestSchema.statics.getAllTranslated = Promise.method(function(currentUser) {
  return this
  .find()
  .then(function(interests) {
    interests = translate(interests, currentUser);
    return interests;
  });
});

interestSchema.statics.searchTranslated = Promise.method(function(searchText, currentUser) {
  var query = {};
  query[currentUser.getLanguage()] = searchText;
  query.userCreated = true;

  return this
  .find(query)
  .then(function(interests) {
    return interests;
  });
});

module.exports = mongoose.model('Interest', interestSchema);