var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var discussionSchema = mongoose.Schema({
    title: String,
    discussionBody: String,
    published: {type: Boolean, default: true },
    author: { type: mongoose.Schema.ObjectId, ref: 'User' },
    model: String,
    model_id: String,
    replies:[
      { type: mongoose.Schema.ObjectId, ref: 'DiscussionReply' }
    ],
    date: { type: Date, default: Date.now }
});

discussionSchema.plugin(deepPopulate);

module.exports = mongoose.model('Discussion', discussionSchema);
