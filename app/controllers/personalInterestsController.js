exports.getAll = function(req, res) {
  var currentUser = req.user;

  return req.models.PersonalInterest
  .getAllTranslated(currentUser)
  .then(function(interests) {
    return res.json(interests);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.send(err);
  });

};

exports.search = function(req, res) {
  var currentUser = req.user;
  var searchText = new RegExp(req.query.searchText, 'i'),
    generateRegExp = function (text) {
      var wordsArr = text.split(' '),
        resultString = '/^';

      _.forEach(wordsArr, function (word, index) {
        //    resultString += index === 0 ? "\\b" + word + "\\b" : ".*\\b" + word + "\\b";
        resultString += "(?=.*\\b" + word + "\\b)";
      });

      return resultString;
    };

  return req.models.PersonalInterest
  .searchTranslated(searchText, currentUser)
  .then(function(interests) {
      return res.json(interests);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.send(err);
  });
};

exports.create = function(req, res) {
  var data = req.body;
  data.userCreated = true;
  
  return req.models.PersonalInterest
  .create(data)
  .then(function(interest) {
    return res.json(interest);
  }, function(err) {
    console.error(err.stack || err);
    return res.send(err);
  });
};