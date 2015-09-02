/**
 * Handle GitHub events.
 */
function onGitHubEvents(req, res) {
  const key = req.params.key;
  console.log(key, req);
  res.send();
}

module.exports = function(app) {
  app.post('/ghhook/:key', onGitHubEvents);
};
