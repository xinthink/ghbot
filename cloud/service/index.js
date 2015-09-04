const repo = require('cloud/service/repo');
const issue = require('cloud/service/issue');

module.exports = function(app, ensureAuthenticated) {
  repo.installRoutes(app, ensureAuthenticated);
};

module.exports.repo = repo;
module.exports.issue = issue;
