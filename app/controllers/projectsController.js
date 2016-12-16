var ModelMap = require('../lib/modelMap');
var modelMap = new ModelMap();
var populate = 'files files.author author';

// POST /api/projects
exports.create = function (req, res) {
  var currentUser = req.user;
  var project = new req.models.Project();
  var data = req.body;

  project.description = data.description;
  project.link = data.link;
  project.author = currentUser._id;

  return project.save()
  .then(function() {
    return req.models.Project.findOne({'_id': project._id}).deepPopulate(populate).exec()
    .then(function() {
        return project.updateFiles(data.files, currentUser, req.models.File);
    })
    .then(function() {
      return res.json(project);
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

  req.models.Project.findById(req.params.id).deepPopulate(populate).exec()
  .then(function (project) {

    project.description = data.description;
    project.link = data.link;
    project.author = currentUser._id;

    return project.updateFiles(data.files, currentUser, req.models.File);
  })
  .then(function(project) {
    return project.save();
  })
  .then(function () {
    return req.models.Project.findById(req.params.id).deepPopulate(populate).exec()
    .then(function (project) {
      return res.json(project);
    });
  }, function (err) {
    console.error(err);
    return res.status(500).send(err);
  });
};

exports.createAndUpdateParent = function(req, res) {
  var currentUser = req.user;
  var project = new req.models.Project();
  var data = req.body;
  
  modelMap.init(req.models);
  
  var item;

  return modelMap[req.params.itemName]
  .findById(req.params.itemId)
  .populate('projects')
  .then(function(i) {
    item = i;

    project.description = data.description;
    project.link = data.link;
    project.author = currentUser._id;

    return project.save();
  })
  .then(function(project) {
    return project.updateFiles(data.files, currentUser, req.models.File);
  })
  .then(function(project) {
    item.projects.push(project._id);
    return item.save();
  })
  .then(function(item) {
    return res.json(project);
  })
  .catch(function(err) {
    console.error(err);
    return res.status(500).send(err);
  })
};

// DELETE /api/projects
exports.delete = function (req, res) {
  var currentUser = req.user;

  return req.models.Project.findById(req.params.id)
  .then(function(project) {
    if (!project) {
      return res.status(404).send('Not found').end();
    }

    if (currentUser._id.equals(project.author) || currentUser.admin) {
      project.remove(function (err, success) {
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