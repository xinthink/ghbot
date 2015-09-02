/*global AV */
const crypto = require('crypto');

const Project = AV.Object.extend('Project');

function getShortName(repo) {
  return repo.full_name.replace(/[-/_.]/g, '');
}

function generateWebhookToken(repo) {
  return crypto.createHash('sha1').update(repo.full_name).digest('hex');
}

/**
 * Create project bound to the repo
 */
function createByRepo(repo) {
  return new AV.Query(Project)
    .equalTo('name', repo.full_name)
    .first()
    .then(function (existPrj) {
      if (!existPrj) {
        const prj = new Project();
        prj.set('name', repo.full_name);
        prj.set('url', repo.html_url);
        prj.set('shortName', getShortName(repo));
        prj.set('webhookToken', generateWebhookToken(repo));
        return prj.save();
      }

      return existPrj;
    });
}

exports.createByRepo = createByRepo;
