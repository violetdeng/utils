var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var tools = require('../../util/tools');

exports.setup = function (User) {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({
        'nickname': username
      },
      function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        } else {
          if (user.authenticate(password)) {
            return done(err, user);
          } else {
            return done(null, false);
          }
        }
      });
    }
  ));
};
