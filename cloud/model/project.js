/*global AV */
const crypto = require('crypto');
const localCfg = require('cloud/local');

function getShortName(repo) {
  return repo.full_name.replace(/[-/_.]/g, '');
}

function generateWebhookToken(repo) {
  return crypto.createHash('sha1').update(repo.full_name).digest('hex');
}

const Project = AV.Object.extend('Project', {
  // instance methods
  getWebhookUrl: function () {
    return localCfg.av_base_url + '/ghhook/' + this.id;
  },

}, {
  // static methods

  findById: function (pid) {
    return new AV.Query(Project).get(pid);
  },

  findByName: function (name) {
    return new AV.Query(Project).equalTo('name', name).first();
  },

  /**
   * Create project bound to the repo
   */
  createByRepo: function (repo) {
    return new AV.Query(Project)
      .equalTo('name', repo.full_name)
      .first()
      .then(function (prj) {
        prj = prj || new Project();
        prj.set('name', repo.full_name);
        prj.set('url', repo.html_url);
        prj.set('shortName', getShortName(repo));
        prj.set('webhookToken', generateWebhookToken(repo));
        prj.set('ghAccessToken', repo.accessToken);
        prj.set('ghRefreshToken', repo.refreshToken);
        return prj.save();
      });
  },

});

module.exports = Project;
