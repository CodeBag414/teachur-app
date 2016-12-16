var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var quizSchema = mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User' },
  score: Number,
  totalAssessments: Number,
  course: { type: mongoose.Schema.ObjectId, ref: 'Course' },
  attempts: [
    {
      takenAt: Date,
      score: Number,
      assessments: [
        { type: mongoose.Schema.ObjectId, ref: 'Assessment' }
      ],
      correctAssessments: [
        { type: mongoose.Schema.ObjectId, ref: 'Assessment' }
      ],
      userAnswers: []
    }
  ]
}, {
  timestamps: true
});

quizSchema.plugin(deepPopulate);

module.exports = mongoose.model('Quiz', quizSchema);