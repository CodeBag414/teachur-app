var config = require('../../config/config');
var amazon = require('amazon-product-api');

var client = amazon.createClient({
  awsId: "AKIAIXQJUP7B7ESTPQPQ",
  awsSecret: "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",
  awsTag: "teachur-20"
});

// awsId: "AKIAI7GKW3BOJTHKVKMQ",
// awsSecret: "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",
// awsTag: "teachur-20"

exports.search = function(req, res) {
    return client
    .itemSearch({ keywords: req.query.search, searchIndex: 'Books', ResponseGroup:'Images,Small'})
    .then(function(books) {
        var response = books.map(function(book) {
            var imageUrl = book.SmallImage ? book.SmallImage[0].URL[0] : undefined;
            var author = book.ItemAttributes[0].Author ? book.ItemAttributes[0].Author[0] : undefined;
            var title = book.ItemAttributes[0].Title ? book.ItemAttributes[0].Title[0] : undefined;

            return {
                imageUrl: imageUrl,
                author: author,
                title: title,
                ASIN: book.ASIN[0],
                url: book.DetailPageURL[0],
            }
        });

        return res.json(response);
    })
    .catch(function(err) {
        console.error(err.stack || err);
        return res.send(err);
    });
};