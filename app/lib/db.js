'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var fetchFiles = require('./fetchFiles');

var dbConfig = require('../../config/db');
// test config
if (process.env.NODE_ENV === 'test') {
    dbConfig = require('../../config/testDb');
}

var mongoUrl = process.env.MONGOLAB_URI || dbConfig.url;

function Db() {
    var _this = this;
    this.mongoose = mongoose;
    this.models = {};
    this.db = {};
    this.connection = {};

    this.init = function() {
        fetchFiles('app/models').map(function(modelFile) {
            var model = require('../../' + modelFile);
            _this.addModel(model.modelName, model.schema);
        });
    };

    this.addModel = function(name, schema) {
        this.models[name] = schema;
    };

    this.get = function(organization) {
        var connectionUrl = organization === 'main' ? mongoUrl : organization.dbUrl;
        var organizationSlug = organization === 'main' ? 'main' : organization.slug;

        if (!organization) {
            return reject(Boom('No organization recieved'));
        }

        if (this.db[organizationSlug]) return this.db[organizationSlug];

        this.connection[organizationSlug] = mongoose.createConnection(connectionUrl);

        this.db[organizationSlug] = {};
        _.each(this.models, (schema, name) => {
            this.db[organizationSlug][name] = this.connection[organizationSlug].model(name, schema);
        });

        return this.db[organizationSlug];
    }
}

module.exports = Db;
