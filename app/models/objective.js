var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var objectiveSchema = mongoose.Schema({
  name: String,
  normalized: String,
  longDescription: String,
  assessmentDescription: String,
  assessmentSecondaryEvidence: String,
  private: {type: Boolean, default: false},
  published: Boolean,
  recommendedMedia: [
    { type: mongoose.Schema.ObjectId, ref: 'File' }
  ],
  prerequisites: [
    {type: mongoose.Schema.ObjectId, ref: 'Objective'}
  ],
  relatedObjectives: [
    {type: mongoose.Schema.ObjectId, ref: 'Objective'}
  ],
  keywords: [
    {type: mongoose.Schema.ObjectId, ref: 'Keyword'}
  ],
  author: {type: mongoose.Schema.ObjectId, ref: 'User'},
  assessments: [
    {type: mongoose.Schema.ObjectId, ref: 'Assessment'}
  ],
  code: String
}, {timestamps: true});

objectiveSchema.methods.updateRecommendedMedia = Promise.method(function(files, currentUser, File) {
  var objective = this;
  return File.updateFiles(objective.recommendedMedia, files, currentUser).then(function(files) {
    objective.recommendedMedia = _.map(files, '_id');
    return objective;
  });
});

objectiveSchema.plugin(deepPopulate);

module.exports = mongoose.model('Objective', objectiveSchema);