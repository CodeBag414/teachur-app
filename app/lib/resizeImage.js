var Promise = require('bluebird');
var lwip = require('lwip');

function resizeImage(image) {
  var type = image.originalname.indexOf('.jpg') !== -1 || image.originalname.indexOf('.jpeg') !== -1 ? 'jpg' : 'png'; 
  return new Promise(function(resolve, reject) {
    lwip.open(image.buffer, type, function(err, img){
      img.cover(300, 300, function(err, img) {
        img.toBuffer(type, function(err, img) {
          resolve(img);
        })
      });
    });
  });
}

module.exports = resizeImage;
