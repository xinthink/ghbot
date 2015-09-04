/*global AV */
const R = require('ramda');

function hasLabel(pattern, issue) {
  const re = new RegExp('^' + pattern + '$', 'i');
  return R.find(function (lbl) {
    return re.test(lbl.name);
  }, issue.get('labels') || []);
}

function isDone(issue) {
  const closed = /^closed$/i.test(issue.get('status'));
  const done = hasLabel('done', issue);
  return closed || done;
}

const Issue = AV.Object.extend('Issue', {
  // instance methods

  update: function (data) {
    this.set('ghId', data.id);
    this.set('number', data.number);
    this.set('title', data.title);
    this.set('body', data.body);
    this.set('url', data.html_url);
    this.set('closedAt', data.closed_at ? new Date(data.closed_at) : undefined);

    // type & status
    this.set('labels', data.labels);
    this.set('status', this.isDone() ? 'done' : data.state);
    this.set('type', this.hasLabel('bug') ? 'bug' : 'task');

    // relationship
    this.set('project', data.project);
    this.set('author', data.author);
    this.set('assignee', data.assignee);
    this.set('milestone', data.milestone);
    return this.save();
  },

  isDone: function () {
    return isDone(this);
  },

  hasLabel: function (pattern) {
    return hasLabel(pattern, this);
  },

}, {
  // static methods

  createOrUpdate: function (data) {
    return new AV.Query(Issue)
      .equalTo('ghId', data.id)
      .first()
      .then(function (issue) {
        return (issue || new Issue()).update(data);
      });
  },
});

module.exports = Issue;
