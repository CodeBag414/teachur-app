var WannabeUser = require('../models/wannabeUser');

// POST /api/waiting-list
exports.signup = function (req, res) {
  var email = req.body.email;
  var wannabeUser = new req.models.WannabeUser();

  if (!email || email === '') {
    res.status(400).send('Email is required');
  }

  req.models.WannabeUser.findOneAsync({email: email}).then(function (user) {

    if (user) {
      return res.status(400).send('Already signed up');
    }

    wannabeUser.email = email;

    wannabeUser.saveAsync(function (user) {
      return res.json({success: true});
    });
    
  })
  .catch(function (err) {
    return res.send(err);
  });

};

exports.addEmail = function (req, res) {
  var email = req.body.email;
  var wannabeUser = new req.models.WannabeUser();

  if (!email || email === '') {
    res.status(400).send('Email is required');
  }

  req.models.WannabeUser.findOneAsync({email: email}).then(function (user) {

    if (user) {
      return res.status(400).send('Already signed up');
    }

    wannabeUser.email = email;
    wannabeUser.invitedBy = req.user._id;

    wannabeUser.saveAsync(function (err, user) {
      return res.json({success: true, user: user});
    });
  }).catch(function (err) {
    return res.send(err);
  });
};

exports.getAll = function (req, res) {

  req.models.WannabeUser.findAsync().then(function (users) {
      return res.json(users);
    })
    .catch(function (err) {
      return res.send(err);
    });

};

exports.grantAccess = function (req, res) {
  var userId = req.params.id;
  var currentUser = req.user;

  if (!currentUser.admin) {
    return res.status(403).send('Forbidden');
  }

  req.models.WannabeUser.findByIdAsync(userId).then(function (user) {
      return user.grantAccess(req.organization).then(function (user) {
        return res.json(user);
      });
    })
    .catch(function (err) {
      console.error(err.stack || err);
      return res.status(500).send(err);
    });

};

exports.delete = function (req, res) {

    req.models.WannabeUser.findById(req.params.id).exec(function (err, user) {
        if (err)
            return res.send(err);

        var currentUser = req.user;
        if (currentUser.admin) {
            user.remove(function (err, success) {
                if (err)
                    return res.send(err);

                res.json({success: true});
            })
        } else {
            res.status(403).send('Forbidden');
        }
    });
};
