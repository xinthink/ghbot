const gh = require('octonode');
const Q = require('q');
const R = require('ramda');

const localCfg = require('cloud/local');

const client = gh.client({
  id: localCfg.gh_client_id,
  secret: localCfg.gh_client_secret,
});
  // headers: {
  //   'user-agent': 'xinthink/ghbot',
  // },

function listUserRepos(user) {
  return Q.ninvoke(client, 'get', '/users/' + user + '/repos')
    .spread(function (status, repos) {
      console.log('user %s has %d repos', user, repos.length);
      return repos;
    });
}

function listOrgRepos(accessToken, org) {
  const ghOrg = gh.client(accessToken).org(org);
  return Q.ninvoke(ghOrg, 'repos', {type: 'member'})
    .spread(function (repos) {
      console.log('org %s has %d accessible repos', org, repos.length);
      return repos;
    });
}

function listOrgs(accessToken, user) {
  const ghMe = gh.client(accessToken).me();
  return Q.ninvoke(ghMe, 'orgs')
    .spread(function (orgs) {
      console.log('user %s belogs to %d orgs', user, orgs.length);
      return orgs;
    });
}

/**
 * List repos of the given user, including org repos
 */
function listAllRepos(accessToken, user) {
  const _lsOrgs = R.partial(listOrgs, accessToken);
  const _lsOrgRepos = R.partial(listOrgRepos, accessToken);

  return Q.all([
    listUserRepos(user),
    _lsOrgs(user)
      .then(function (orgs) {
        orgs = R.pluck('login', orgs);
        return Q.all(R.map(_lsOrgRepos, orgs));
      }),
  ]).then(R.flatten);
}

/**
 * Get info of the given repo
 */
function getRepo(accessToken, repoName) {
  const ghRepo = gh.client(accessToken).repo(repoName);
  return Q.ninvoke(ghRepo, 'info').spread(R.nthArg(1));
}

function createWebhook(accessToken, repoName, webhookUrl) {
  const ghRepo = gh.client(accessToken).repo(repoName);
  return Q.ninvoke(ghRepo, 'hooks')
    .spread(function (hooks) {
      const hookUrlEq = R.compose(R.propEq('url', webhookUrl), R.prop('config'));
      const existHook = R.find(hookUrlEq, hooks);
      if (existHook) {
        return existHook;
      }

      return Q.ninvoke(ghRepo, 'hook', {
        name: 'web',
        config: {
          url: webhookUrl,
        },
        active: true,
        events: ['push', 'issues'],
      });
    })
    .spread(R.nthArg(1));
}

exports.listAllRepos = listAllRepos;
exports.listUserRepos = listUserRepos;
exports.getRepo = getRepo;
exports.createWebhook = createWebhook;
