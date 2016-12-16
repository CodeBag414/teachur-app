exports.search = function(req, res) {
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

  return req.models.Keyword
  .find({ text: searchText })
  .then(function(keywords) {
    return res.json(keywords);
  })
  .catch(function(err) {
    console.error(err.stack || err);
    return res.send(err);
  });
};
