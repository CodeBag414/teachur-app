var _ = require('lodash');

function translate(items, currentUser) {
  var userLang = currentUser.getLanguage();

  if (_.isArray(items)) {
    return _.map(items, function(item) {
      return { name: item[userLang], _id: item.id, userCreated: item.userCreated };
    });
  }

  return items[userLang];
};

module.exports = translate;