var getRandomString = require('../../helpers').getRandomString;
var config = require('../../protractor.conf.js').config;

var ObjectivesPage = function() {
  var pagesMap = {
    single: config.baseUrl + '#/courses/:id',
    create: config.baseUrl + '#/courses/create',
    edit: config.baseUrl + '#/courses/:id/edit',
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
    element(by.model('course.name')).sendKeys(getRandomString(5));
    return element(by.id('save-btn')).click();
  };

  this.update = function() {
    element(by.model('course.name')).clear().sendKeys('updated item');
    return element(by.id('save-btn')).click();
  };
};

module.exports = ObjectivesPage;
