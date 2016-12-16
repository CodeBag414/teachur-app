var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var courseSchema = mongoose.Schema({
  name: String,
  normalized: String,
  introVideo: String,
  shortDescription: String,
  longDescription: String,
  goals: [
    {type: String}
  ],
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
    {type: mongoose.Schema.ObjectId, ref: 'Lesson'}
  ],
  prerequisites: [
    {type: mongoose.Schema.ObjectId, ref: 'Course'}
  ],
  relatedCourses: [
    {type: mongoose.Schema.ObjectId, ref: 'Course'}
  ],
  keywords: [
    {type: mongoose.Schema.ObjectId, ref: 'Keyword'}
  ],
  projects: [
    {type: mongoose.Schema.ObjectId, ref: 'Project'}
  ],
  author: {type: mongoose.Schema.ObjectId, ref: 'User'},
  image: {type: mongoose.Schema.ObjectId, ref: 'Image'},
  croppedImage: {type: mongoose.Schema.ObjectId, ref: 'Image'},
  statistics: {},
  suggestedTexts: [
    {
      imageUrl: String,
      author: String,
      title: String,
      ASIN: String,
      url: String
    }
  ],
  code: String
}, { timestamps: true });

courseSchema.plugin(deepPopulate);

module.exports = mongoose.model('Course', courseSchema);