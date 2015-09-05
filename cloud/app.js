// 在 Cloud code 里初始化 Express 框架
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const app = express();

const localCfg = require('cloud/local');
const User = require('cloud/model/user');

// App 全局配置
app.set('views', 'cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cookieSession({
  keys: localCfg.cookieKeys,
}));

// github oauth
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.
passport.serializeUser(function(user, done) {
  User.createOrUpdate(user).then(function (savedUser) {
    done(null, savedUser.id);
  }, done);
});

passport.deserializeUser(function(obj, done) {
  const uid = (obj || {}).id || obj;
  User.findById(uid).then(function (user) {
    user.username = user.get('username');
    user.accessToken = user.get('ghAccessToken');
    user.refreshToken = user.get('ghRefreshToken');
    done(null, user);
  }, done);
});


// Use the GitHubStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and GitHub
//   profile), and invoke a callback with a user object.
passport.use(new GitHubStrategy({
    clientID: localCfg.gh_client_id,
    clientSecret: localCfg.gh_client_secret,
    callbackURL: localCfg.gh_oauth_callback_url,
  }, function(accessToken, refreshToken, profile, done) {
    // console.log('GitHub oauth done', accessToken, refreshToken, profile);
    profile._json.accessToken = accessToken;
    profile._json.refreshToken = refreshToken;
    done(null, profile._json);
  }
));

// GET /auth
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHub will redirect the user
//   back to this application at /auth/callback
app.get('/auth', passport.authenticate('github', { scope: ['repo'] }));

// GET /auth/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/repo/list');
  });

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

// routes
const useRoutes = require('cloud/routes');
useRoutes(app, ensureAuthenticated);

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
