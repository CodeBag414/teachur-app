var config = require('../../protractor.conf.js').config;

var LoginPage = function() {
  this.get = function() {
    browser.driver.get(config.baseUrl + '#/login');
  };

  this.login = function() {
    var userNameField = element(by.model('user.username'));
    var userPassField = element(by.model('user.password'));
    var userLoginBtn  = element(by.id('login-btn'));
    
    userNameField.sendKeys('anovoselnik');
    userPassField.sendKeys('131213');
    
    return userLoginBtn.click();
  };
};

module.exports = LoginPage;
