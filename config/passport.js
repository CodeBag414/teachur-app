var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var config = require('./config');

// load up the user model
var User = require('../app/models/user');

var urlBase = process.env.URL || 'http://localhost:8080';

// expose this function to our app using module.exports
module.exports = function (passport) {

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  }, function (req, username, password, done) {
    process.nextTick(function () {
      User.findOne({username: username}, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!user.verifyPassword(password)) {
          return done(null, false);
        }
        return done(null, user);
      });
    });
  }));

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  // passport.use(new BearerStrategy(function (token, done) {

  //     User.findOne({accessToken: token}, function (err, user) {
  //       if (err) {
  //         return done(err);
  //       }
  //       if (!user) {
  //         return done(null, false);
  //       }
  //       return done(null, user, {scope: 'all'});
  //     });
  //   }
  // ));

  passport.use(new FacebookStrategy({
      clientID: config.facebookAppId,
      clientSecret: config.facebookAppSecret,
      callbackURL: urlBase + "/api/auth/facebook/callback",
      enableProof: false
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {

        User.findOne({facebookId: profile.id}, function (err, user) {
          if (!user) {
            User.create({
              facebookId: profile.id,
              username: profile.username,
              facebookImage: profile.photos ? profile.photos[0].value : null
            }, function (err, user) {
              return done(err, user);
            });
          } else {
            return done(err, user);
          }
        });
      });
    }
  ));

  passport.use(new TwitterStrategy({
      consumerKey: config.twitterAppId,
      consumerSecret: config.twitterAppSecret,
      callbackURL: urlBase + "/api/auth/twitter/callback"
    },
    function (token, tokenSecret, profile, done) {
      User.findOne({$or: [{twitterId: profile.id}]}, function (err, user) {
        if (!user) {
          User.create({
            twitterId: profile.id,
            username: profile.username,
            twitterImage: profile.photos[0].value
          }, function (err, user) {
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    }));

  passport.use(new GoogleStrategy({
      clientID: config.googleAppId,
      clientSecret: config.googleAppSecret,
      callbackURL: urlBase + "/api/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {

        User.findOne({googleId: profile.id}, function (err, user) {
          if (!user) {

            User.create({
              googleId: profile.id,
              username: profile.displayName,
              googleImage: profile.photos[0].value
            }, function (err, user) {
              return done(err, user);
            });
          } else {
            return done(err, user);
          }
        });
      });
    }
  ));

};
