var mongoose = require('mongoose');

var settingsSchema = mongoose.Schema({
  key: String,
  value: String
});

module.exports = mongoose.model('Settings', settingsSchema);