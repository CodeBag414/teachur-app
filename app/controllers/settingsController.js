var Settings = require('../models/settings');

exports.update = function(req, res) {
  return Settings
  .findOne({ key: req.body.key })
  .then(function(setting) {
    if (!setting) {
      setting = new Settings();
      setting.key = req.body.key;
    }

    setting.value = req.body.value;
    return setting.save();
  })
  .then(function(setting) {
    return res.send(setting);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  })
};

exports.getAll = function(req, res) {
  return Settings
  .find()
  .then(function(settings) {
    return res.json(settings);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.status(500).send(err);
  });
};