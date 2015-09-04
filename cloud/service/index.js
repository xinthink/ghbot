const prj = require('cloud/service/project');
const issue = require('cloud/service/issue');

module.exports = function(app, ensureAuthenticated) {
  prj.installRoutes(app, ensureAuthenticated);
};

module.exports.project = prj;
module.exports.issue = issue;
