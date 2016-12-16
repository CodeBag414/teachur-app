// POST /api/discussion
exports.create = function (req, res) {
  var currentUser = req.user;
  var discussion = new req.models.Discussion();
  var data = req.body;

  discussion = populateDiscussion(discussion, data, currentUser);
  discussion.save(function (err) {
    if (err) {
      return res.send(err);
    }

    req.models.Discussion.findById(discussion._id).deepPopulate('author author.image author.croppedImage').exec(function (err, discussion) {
      if (err) {
        return res.send(err);
      }

      res.json(discussion);
    });

  });

};

// PUT /api/discussion
exports.update = function (req, res) {
  var currentUser = req.user;
  var data = req.body;

  req.models.Discussion.findById(req.params.id, function (err, discussion) {
     if (currentUser._id.equals(discussion.author) || currentUser.admin) {
      discussion.title = data.title;
      discussion.discussionBody = data.discussionBody;
      discussion.save(function (err) {
        if (err)
          return res.send(err);

        req.models.Discussion.findById(req.params.id).deepPopulate('author replies.author replies.author.croppedImage').exec(function (err, discussion) {
          if (err)
            return res.send(err);

          res.json(discussion);
        });

      });
    } else {
      res.status(403).send('Forbidden');
    }

  });
};

exports.updateReply = function (req, res) {
  var currentUser = req.user;
  var data = req.body;

  req.models.DiscussionReply.findById(data._id, function (err, reply) {
     if (currentUser._id.equals(reply.author) || currentUser.admin) {
      reply.discussionReplyBody = data.discussionReplyBody;
      reply.save(function (err) {
        if (err) return res.send(err);

        req.models.DiscussionReply.findById(data._id).deepPopulate('author author.image author.croppedImage').exec(function (err, reply) {
          if (err)
            return res.send(err);

          res.json(reply);
        });

      });
    } else {
      res.status(403).send('Forbidden');
    }

  });
};

exports.getModelDiscussions = function (req, res) {
  req.models.Discussion.find({
    model: req.params.model,
    model_id: req.params.id,
    published: true
  })
  .deepPopulate('author replies replies.author author.image  author.croppedImage  replies.author.image replies.author.croppedImage')
  .populate({
    path: 'replies',
    match: { published: true}
  }).exec(function (err, discussions) {
    if (err) {
      return res.send(err);
    }
    
    res.json(discussions);
  });

};
//api/discussion/:id/reply
exports.createReply = function (req, res) {
  var currentUser = req.user;
  var discussionReply = new req.models.DiscussionReply();
  var data = req.body;
  var discussion_id = data.discussion_id;

  discussionReply = populateReply(discussionReply, data, currentUser);

  discussionReply.save(function (err) {
    if (err) {
      return res.send(err);
    }

    req.models.Discussion.findById(discussion_id).exec(function (err, discussion) {

      if (discussion) {
        discussion.replies.push(discussionReply);
        discussion.save(function (err) {
          if (err) {
            return res.send(err);
          }
          res.json(discussionReply);
        });
      } else {
        return res.send(err);
      }
    });

  });
};

 // DELETE /api/discussion/:id
 exports.delete = function (req, res) {
   var currentUser = req.user;
   var itemId = req.params.id;

   req.models.Discussion.findById(req.params.id, function (err, discussion) {

     if (currentUser._id.equals(discussion.author) || currentUser.admin) {

       discussion.published = false;

       discussion.save(function (err) {
          if (err)
            return res.send(err);

          res.status(200).send();
        });

     } else {
       res.status(403).send('Forbidden');
     }

   });
 };


 // DELETE /api/discussion/:id
 exports.deleteReply = function (req, res) {
   var currentUser = req.user;
   var itemId = req.params.id;

   req.models.DiscussionReply.findById(itemId, function (err, reply) {

     if (currentUser._id.equals(reply.author) || currentUser.admin) {

       reply.published = false;

       reply.save(function (err) {
          if (err)
            return res.send(err);
          
          res.status(200).send();
        });

     } else {
       res.status(403).send('Forbidden');
     }

   });
 };

// HELPER METHODS

var populateDiscussion = function populateDiscussion(discussion, data, currentUser) {
  discussion.title = data.title;
  discussion.discussionBody = data.discussionBody;
  discussion.published = true;
  discussion.model = data.model;
  discussion.model_id = data.model_id;
  discussion.author = currentUser._id;
  discussion.replies = [];
  return discussion;
};

var populateReply = function populateReply(reply, data, currentUser) {
  reply.discussionReplyBody = data.discussionReplyBody;
  reply.published = true;
  reply.author = currentUser._id;
  return reply;
};
