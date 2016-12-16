var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var degreeSchema = mongoose.Schema({
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
    {type: mongoose.Schema.ObjectId, ref: 'Course'}
  ],
  prerequisites: [
    {type: mongoose.Schema.ObjectId, ref: 'Degree'}
  ],
  relatedDegrees: [
    {type: mongoose.Schema.ObjectId, ref: 'Degree'}
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
}, {
  timestamps: true,
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

degreeSchema.virtual('allAssessments');

degreeSchema.plugin(deepPopulate);

module.exports = mongoose.model('Degree', degreeSchema);