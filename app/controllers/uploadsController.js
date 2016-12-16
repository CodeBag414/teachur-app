var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var config = require('../../config/config');
var userController = require('../controllers/usersController.js');
var resizeImage = require('../lib/resizeImage');

AWS.config.update({accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey});

exports.uploadImage = function (req, res) {
  var user = req.user;

  if (!req.file) {
    return res.status(403).send('expect 1 file upload named file').end();
  }
  var file = req.file;

  // this is mainly for user friendliness. this field can be freely tampered by attacker.
  if (!/^image\/(jpe?g|png|gif)$/i.test(file.mimetype)) {
    return res.status(403).send('expect image file').end();
  }

  var pid = '10000' + parseInt(Math.random() * 10000000);

  uploadToS3(file, pid, function (err, data) {
    if (err) {
      console.error(err);
      return res.status(500).send('failed to upload to s3').end();
    }
    var image = new req.models.Image();
    image.url = data.Location;
    image.pid = pid;
    user.image = image;
    user.croppedImage = null;

    image.save(function (err) {
      user.save(function (err) {
        res.json(image);
      })
    });

  })
};

exports.uploadCroppedImage = function (req, res) {
  var user = req.user;
  if (!req.file) {
    return res.status(403).send('expect 1 file upload named file').end();
  }
  var file = req.file;

  var pid = '10000' + parseInt(Math.random() * 10000000);

  userController.populateUserFields(user._id, 'croppedImage', function (populatedUser) {
    var removePid = populatedUser.croppedImage ? populatedUser.croppedImage : null;
    removeFromS3(removePid, function () {
      uploadToS3(file, pid, function (err, data) {
        if (err) {
          console.error(err);
          return res.status(500).send('failed to upload to s3').end();
        }
        var image = new req.models.Image();
        image.url = data.Location;
        image.pid = pid;

        user.croppedImage = image;

        image.save(function (err) {
          user.save(function (err) {
            res.json(image);
          })
        });

      })
    });
  });


};

exports.uploadCourseCroppedImage = function (req, res) {
  req.models.Course.findById(req.params.id).populate('image croppedImage').exec(function (err, course) {
    if (err) {
      return res.send(err);
    }

    if (!req.file) {
      return res.status(403).send('expect 1 file upload named file').end();
    }
    var file = req.file;

    var pid = '10000' + parseInt(Math.random() * 10000000);

    var removePid = course.croppedImage ? course.croppedImage : null;

    removeFromS3(removePid, function () {
      uploadToS3(file, pid, function (err, data) {
        if (err) {
          return res.status(500).send('failed to upload to s3').end();
        }

        var image = new req.models.Image();
        image.url = data.Location;
        image.pid = pid;

        course.croppedImage = image;

        image.save(function () {
          course.save(function () {
            res.json(image);
          });
        });
      });
    });
  });
};

exports.uploadCourseImage = function (req, res) {
  req.models.Course.findById(req.params.id).populate('image').exec(function (err, course) {

    if (err)
      return res.send(err);

    if (!req.file) {
      return res.status(403).send('expect 1 file upload named file').end();
    }

    
    var file = req.file;

    var pid = '10000' + parseInt(Math.random() * 10000000);

    uploadToS3(file, pid, function (err, data) {
      if (err) {
        console.error(err);
        return res.status(500).send('failed to upload to s3').end();
      }

      return resizeImage(req.file)
      .then(function(resizedImage) {

        pid = '10000' + parseInt(Math.random() * 10000000);

        uploadToS3(resizedImage, pid, function (err, resizedData) {
          if (err) {
            console.error(err);
            return res.status(500).send('failed to upload to s3').end();
          }

          var image = new req.models.Image();
          image.pid = pid;
          image.url = data.Location;
          image.thumbnailUrl = resizedData.Location;

          image.save(function (err) {
            course.image = image;

            course.save(function (err) {
              res.json(image);
            })
          });

        });  

      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send(err);
      });

    });

  });

};

exports.uploadFile = function(req, res) {
  var Model = req.models.Objective;
  var filesPath = 'recommendedMedia';
  
  if (req.params.itemName === 'assessment') {
    Model = req.models.Assessment;
    filesPath = 'files';
  }

  if (req.params.itemName === 'project') {
    Model = req.models.Project;
    filesPath = 'files';
  }

  if (req.params.itemName === 'student-project') {
    return upload
  }

  Model.findById(req.params.id).populate(filesPath).exec(function (err, item) {

    if (err)
      return res.send(err);

    if (!req.file) {
      return res.status(403).send('expect 1 file upload named file').end();
    }

    var file = req.file;
    var pid = '10000' + parseInt(Math.random() * 10000000) + path.extname(req.file.originalname);

    uploadToS3(file, pid, function (err, data) {
      if (err) {
        return res.status(500).send('failed to upload to s3').end();
      }

      try {
        var itemFile = _.find(item[filesPath], function(o) {
          return req.params.fileId === o._id.toHexString();
        });

        var file = itemFile ? itemFile : new req.models.File();
        file.pid = pid;
        file.url = data.Location;
        file.name = req.file.originalname;
        file.type = req.file.mimetype;
        file.external = false;
        file.author = req.user._id;
        file.description = req.file.description;
      } catch(err) {
        return res.status(500).send('upload failed').end();
      }

      file.save(function (err) {
        var fileIndex = _.findIndex(item[filesPath], function(o) {
          return req.params.fileId === o._id.toHexString();
        });

        if (fileIndex !== -1) {
          item[filesPath][fileIndex] = file; 
        } else {
          item[filesPath].push(file._id);
        }

        item.save(function (err) {
          res.json(item);
        })
      });

    })
  });
};

exports.uploadStudentProject = function(req, res) {
  var currentUser = req.user;
  var projectId = req.params.projectId;

  if (!req.file) {
    return res.status(403).send('expect 1 file upload named file').end();
  }

  var file = req.file;
  var pid = '10000' + parseInt(Math.random() * 10000000) + path.extname(req.file.originalname);

  uploadToS3(file, pid, function (err, data) {
    if (err) {
      return res.status(500).send('failed to upload to s3').end();
    }

    var file = new req.models.File();
    file.pid = pid;
    file.url = data.Location;
    file.name = req.file.originalname;
    file.type = req.file.mimetype;
    file.external = false;
    file.author = req.user._id;

    file.save(function (err) {
      currentUser.projects.push({
        project: projectId,
        file: file
      });

      // var fileIndex = _.findIndex(item[filesPath], function(o) {
      //   return req.params.fileId === o._id.toHexString();
      // });

      // if (fileIndex !== -1) {
      //   item[filesPath][fileIndex] = file; 
      // } else {
      //   item[filesPath].push(file._id);
      // }

      currentUser.save(function (err, user) {
        res.json(user);
      })
    });

  });
};

var photoBucket = new AWS.S3({params: {Bucket: config.s3BucketName, region: config.region}});

function uploadToS3(file, destFileName, callback) {
  photoBucket
    .upload({
      ACL: 'public-read',
      Body: file.buffer || file,
      Key: destFileName.toString(),
      ContentType: 'application/octet-stream' // force download if it's accessed as a top location
    })
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#httpUploadProgress-event
    // .on('httpUploadProgress', function(evt) { console.log(evt); })
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#send-property
    .send(callback);
}

function uploadBinaryToS3(fileBinary, destFileName, callback) {
  var binaryBuffer = new Buffer(fileBinary.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  photoBucket
    .upload({
      ACL: 'public-read',
      Body: binaryBuffer,
      Key: destFileName.toString(),
      ContentEncoding: 'base64',
      ContentType: 'image/png'
    })
    .send(callback);
}

function removeFromS3(key, callback) {
  var imageKey = key ? key.toString() : null;
  photoBucket.deleteObject({
      Key: imageKey,
      Bucket: config.s3BucketName
    })
    .send(callback);
}