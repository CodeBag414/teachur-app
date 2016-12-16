var LoginPage = require('./login.page');

describe('Login', function () {
  var loginPage = new LoginPage();
  loginPage.get();

  describe("index", function () {
    it('should render login page', function() {
      var currentUrl = browser.driver.getCurrentUrl();
      expect(currentUrl).toMatch('/login');
    });

    it('should login', function() {
      loginPage.login().then(function() {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).toMatch('/dashboard');
      });
    });

  });
});