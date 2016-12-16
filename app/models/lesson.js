var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var lessonSchema = mongoose.Schema({
  name: String,
  normalized: String,
  introVideo: String,
  shortDescription: String,
  longDescription: String,
  assessmentDescription: String,
  assessmentSecondaryEvidence: String,
  private: Boolean,
  published: Boolean,
  recommendedMedia: [
    {
      url: String,
      description: String
    }
  ],
  components: [
    {type: mongoose.Schema.ObjectId, ref: 'Objective'}
  ],
  prerequisites: [
    {type: mongoose.Schema.ObjectId, ref: 'Lesson'}
  ],
  relatedLessons: [
    {type: mongoose.Schema.ObjectId, ref: 'Lesson'}
  ],
  keywords: [
    {type: mongoose.Schema.ObjectId, ref: 'Keyword'}
  ],
  author: {type: mongoose.Schema.ObjectId, ref: 'User'},
  statistics: {},
  projects: [
    {type: mongoose.Schema.ObjectId, ref: 'Project'}
  ],
  code: String
}, {timestamps: true});

lessonSchema.plugin(deepPopulate);

module.exports = mongoose.model('Lesson', lessonSchema);