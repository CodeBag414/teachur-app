var getRandomString = require('../../helpers').getRandomString;
var config = require('../../protractor.conf.js').config;

var ObjectivesPage = function() {
  var pagesMap = {
    single: config.baseUrl + '#/objectives/:id',
    create: config.baseUrl + '#/objectives/create',
    edit: config.baseUrl + '#/objectives/:id/edit',
  };

  this.getUrl = function(page, id) {
    var pageUrl = pagesMap[page];

    if (page === 'edit') {
      pageUrl = pageUrl.replace(':id', id);
    }

    return pageUrl;
  };

  this.get = function(page, id) {
    browser.driver.get(this.getUrl(page, id));
  };

  this.create = function() {
    element(by.model('objective.name')).sendKeys(getRandomString(5));
    return element(by.id('save-btn')).click();
  };

  this.update = function() {
    element(by.model('objective.name')).clear().sendKeys('updated item');
    return element(by.id('save-btn')).click();
  };
};

module.exports = ObjectivesPage;
