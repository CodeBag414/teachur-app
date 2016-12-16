var ModelMap = require('../lib/modelMap');
var modelMap = new ModelMap();
var populate = 'files files.author author';

// POST /api/assessments
exports.create = function (req, res) {
  var currentUser = req.user;
  var assessment = new req.models.Assessment();
  var data = req.body;

  assessment.type = data.type;
  assessment.question = data.question;
  assessment.answers = data.answers;
  assessment.author = currentUser._id;

  return assessment.save()
  .then(function() {
    return req.models.Assessment.findOne({'_id': assessment._id}).deepPopulate(populate).exec()
    .then(function() {
        return assessment.updateFiles(data.files, currentUser, req.models.File);
    })
    .then(function() {
      return res.json(assessment);
    })
    .catch(function(err) {
      console.error(err);
      return res.status(500).send(err);
    });
  }, function(err) {
    console.error(err);
    return res.status(500).send(err);
  });
};

exports.update = function (req, res) {
  var currentUser = req.user;
  var data = req.body;

  req.models.Assessment.findById(req.params.id).deepPopulate(populate).exec()
  .then(function (assessment) {

    assessment.type = data.type;
    assessment.question = data.question;
    assessment.answers = data.answers;

    return assessment.updateFiles(data.files, currentUser, req.models.File);
  })
  .then(function(assessment) {
    return assessment.save();
  })
  .then(function () {
    return req.models.Assessment.findById(req.params.id).deepPopulate(populate).exec()
    .then(function (assessment) {
      return res.json(assessment);
    });
  }, function (err) {
    console.error(err);
    return res.status(500).send(err);
  });
};

exports.createAndUpdateParent = function(req, res) {
  var currentUser = req.user;
  var assessment = new req.models.Assessment();
  var data = req.body;
  
  modelMap.init(req.models);
  
  var item;

  return modelMap[req.params.itemName]
  .findById(req.params.itemId)
  .populate('assessments')
  .then(function(i) {
    item = i;

    assessment.type = data.type;
    assessment.question = data.question;
    assessment.answers = data.answers;
    assessment.author = currentUser._id;

    return assessment.save();
  })
  .then(function(assessment) {
    return assessment.updateFiles(data.files, currentUser, req.models.File);
  })
  .then(function(assessment) {
    item.assessments.push(assessment._id);
    return item.save();
  })
  .then(function(item) {
    return res.json(assessment);
  })
  .catch(function(err) {
    console.error(err);
    return res.status(500).send(err);
  })
};

// DELETE /api/assessments
exports.delete = function (req, res) {
  var currentUser = req.user;

  return req.models.Assessment.findById(req.params.id)
  .then(function(assessment) {
    if (!assessment) {
      return res.status(404).send('Not found').end();
    }

    if (currentUser._id.equals(assessment.author) || currentUser.admin) {
      assessment.remove(function (err, success) {
        if (err)
          return res.send(err);

        res.json({success: true});
      });
    } else {
      return res.status(403).send('Forbidden').end();
    }
    
  }, function(err) {
    console.error(err);
    return res.status(500).send(err);
  });
};