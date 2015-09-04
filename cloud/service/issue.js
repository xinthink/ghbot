const Q = require('q');
const model = require('cloud/model');
const util = require('cloud/util');

function createOrUpdateMilestone(project, data) {
  return model.Milestone.createOrUpdate(util.setProp('project', project, data));
}

function onIssueOpened(prj, event) {
  const data = event.issue;
  const assigneeData = data.assignee;
  const milestoneData = data.milestone;
  console.log('onIssueOpened', data.html_url);

  const ps = [
    // project
    Q(prj),
    // author
    model.User.createOrUpdate(data.user),
    // assignee
    (assigneeData && assigneeData.id !== data.user.id) ?
      model.User.createOrUpdate(assigneeData) : Q(null),
    // milestone
    milestoneData ?
      createOrUpdateMilestone(prj, milestoneData) : Q(null),
  ];

  return Q.all(ps)
    .spread(function (project, author, assignee, milestone) {
      data.project = project;
      data.user = data.author = author;
      data.assignee = assigneeData ? assignee || author : undefined;
      data.milestone = milestone;
      return model.Issue.createOrUpdate(data);
    }).then(function (issue) {
      console.log('issue created', issue.get('url'));
    });
}

const eventHandlers = {
  opened: onIssueOpened,
};

function onIssuesEvent(prjId, event) {
  const prj = new model.Project();
  prj.id = prjId;

  const action = event.action;
  if (eventHandlers[action]) {
    return eventHandlers[action](prj, event)
      .fail(function (err) {
        console.error('eventHandler failed', err);
      });
  }
}

exports.onIssuesEvent = onIssuesEvent;
