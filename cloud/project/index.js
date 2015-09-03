const gh = require('cloud/github');
const prj = require('cloud/model').project;

/**
 * Listing GitHub repos.
 */
function listRepos(req, res) {
  gh.listAllRepos(req.user.accessToken, req.user.username)
    .then(function (repos) {
      res.render('select-repo', {repos: repos});
    })
    .catch(function (err) {
      res.send(err);
    });
}

/**
 * Create project bound to the repo.
 */
function bindRepo(req, res) {
  const repoName = req.query.repo;
  const accessToken = req.user.accessToken;

  gh.getRepo(accessToken, repoName)
    .then(function (repo) {
      return prj.createByRepo(repo);
    })
    .then(function (p) {
      // add webhook to the repo
      const hookUrl = prj.getWebhookUrl(p);
      return gh.createWebhook(accessToken, p.get('name'), hookUrl);
    })
    .then(function () {
      res.send('OK');
    })
    .catch(function (err) {
      res.send(err);
    });
}

module.exports = function(app, ensureAuthenticated) {
  app.get('/repo/list', ensureAuthenticated, listRepos);
  app.get('/repo/bind', ensureAuthenticated, bindRepo);
};
