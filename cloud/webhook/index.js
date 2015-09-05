const util = require('cloud/util');
const issueSvc = require('cloud/service').issue;
const pushHandler = require('cloud/webhook/push');

/**
 * Handle GitHub events.
 */
function onGitHubEvents(req, res) {
  const id = req.params.id;
  const eventName = req.headers['X-Github-Event'] || req.headers['x-github-event'];
  var event = req.body.payload || req.body;

  if (util.isString(event)) {
    event = JSON.parse(event);
  }

  switch (eventName) {
    case 'issues':
      issueSvc.onIssuesEvent(id, event);
      break;
    case 'push':
      pushHandler.onPush(id, event);
      break;
    default:
      console.log('ignored event', eventName);
      break;
  }

  res.send();
}

module.exports = function(app) {
  app.post('/ghhook/:id', onGitHubEvents);
};
