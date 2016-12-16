var _ = require('lodash');
var ItemsPage = require('./lessons.page');

describe('Lessons', function () {
  var itemsPage = new ItemsPage();

  describe('create', function () {
    it('should render create page', function() {
      itemsPage.get('create');
      var currentUrl = browser.driver.getCurrentUrl();
      expect(currentUrl).toMatch(itemsPage.getUrl('create'));
    });

    it('should create item', function() {
      itemsPage.create().then(function() {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).not.toMatch(itemsPage.getUrl('create'));
      });
    });

    it('should update item', function() {
      browser.driver.getCurrentUrl().then(function(url) {
        var itemId = _.last(url.split('/'));
        itemsPage.get('edit', itemId);

        itemsPage.update().then(function() {
          browser.waitForAngular();
          expect(browser.driver.getCurrentUrl()).not.toMatch(itemsPage.getUrl('edit', itemId));
          browser.waitForAngular();
          expect(element(by.id('item-name')).getText()).toMatch('UPDATED ITEM');
        });
      });
    });

  });
});