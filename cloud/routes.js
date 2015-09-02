module.exports = function(app, ensureAuthenticated) {
  require('cloud/webhook')(app);
  require('cloud/project')(app, ensureAuthenticated);
};
