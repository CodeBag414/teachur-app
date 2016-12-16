var allowedRoutes = [
  '/objectives',
  '/lessons',
  '/courses',
  '/degrees',
  '/objectives/search',
  '/lessons/search',
  '/courses/search',
  '/degrees/search',
  '/objectives/:id',
  '/lessons/:id',
  '/courses/:id',
  '/degrees/:id',
  '/objectives/:id/current-use',
  '/lessons/:id/current-use',
  '/courses/:id/current-use',
  '/degrees/:id/current-use',
];

function authenticateUser(req, res, next) {
  var token = req.get('Authorization');

  if (!isAllowed(req.originalUrl) && (token === 'Bearer null' || !token)) {
    return res.status(401).send('Unauthorized');
  }

  if (token) {
    token = token.slice(7, token.length);

    return req.models.User.findOne({accessToken: token}, function (err, user) {
      
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).send('Unauthorized');
      }

      req.user = user;

      return next();
    });
  }

  return next();

};

function isAllowed(originalUrl) {
  var allowed = false;

  allowedRoutes.forEach(function(url) {
    if (originalUrl.indexOf(url) !== undefined && originalUrl.indexOf(url) !== -1) {
      allowed = true;
    };
  });

  return allowed;
};

module.exports = authenticateUser;
