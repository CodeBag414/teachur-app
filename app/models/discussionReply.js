var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var discussionReplySchema = mongoose.Schema({
    discussionReplyBody: String,
    published: Boolean,
    author: { type: mongoose.Schema.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
});

discussionReplySchema.plugin(deepPopulate);


module.exports = mongoose.model('DiscussionReply', discussionReplySchema);
