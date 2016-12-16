var Promise = require('bluebird');
var mongoose = require('mongoose');
var crypto = require('crypto');
var mandrill = require('../lib/mandrill');
var Settings = require('./settings');

Promise.promisifyAll(mongoose);

var wannabeUserSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    signupToken: String,
    signupTokenUsed: Boolean,
    invitedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
    organizationAdmin: { type: Boolean, default: false }
});

wannabeUserSchema.methods.grantAccess = Promise.method(function grantAccess(organization) {
    var wannabeUser = this;
    var urlBase = process.env.URL || 'http://localhost:8080';

    wannabeUser.signupToken = crypto.createHash('md5').update(wannabeUser.email + new Date).digest('hex');
    wannabeUser.signupTokenUsed = false;

    return wannabeUser.save().then(function() {
        var data = {
          signupUrl: urlBase + "/app#/signup/" + wannabeUser.signupToken
        };

        if (organization) {
            data.signupUrl = urlBase + '/org/' + organization.slug + '#/signup/' + wannabeUser.signupToken;
        };

        return Settings
        .findOne({ key: 'grantAccessTemplate' })
        .then(function(setting) {
            return mandrill.sendTemplate(wannabeUser.email, setting.value, data)
        })
        .then(function(response) {
            console.log(response);
            return wannabeUser;
        })
        .catch(function(err) {
          console.error(err.stack || err);
          throw err;
        });
    });
});

module.exports = mongoose.model('WannabeUser', wannabeUserSchema);