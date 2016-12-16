var Organization = require('../models/organization');
var Db = require('./db');

var db = new Db();
db.init();

function OrganizationsMiddleware (req, res, next) {
  var organizationSlug = req.get('organization') || 'main';

  req.db = db;

  if (organizationSlug !== 'main') {
    return Organization
    .findOne({ slug: organizationSlug })
    .then(function(organization) {
        if (!organization) {
          return res.error('Unexisting organization');
        }

        req.models = db.get(organization);
        req.organization = organization;
        return next();
    });
  }

  req.models = db.get(organizationSlug);
  req.organization = false;

  return next();
}

module.exports = OrganizationsMiddleware;
