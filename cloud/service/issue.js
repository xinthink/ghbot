const Q = require('q');
const R = require('ramda');

const model = require('cloud/model');
const util = require('cloud/util');
const gh = require('cloud/github');

function createOrUpdateMilestone(project, data) {
  return model.Milestone.createOrUpdate(util.setProp('project', project, data));
}

function handleIssueEvent(prj, event) {
  const data = event.issue;
  const assigneeData = data.assignee;
  const milestoneData = data.milestone;
  console.log('handling event of issue', data.html_url);

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
      console.log('issue created/updated', issue.get('url'));
    });
}

const eventHandlers = {
  opened: handleIssueEvent,
  assigned: handleIssueEvent,
  unassigned: handleIssueEvent,
  labeled: handleIssueEvent,
  unlabeled: handleIssueEvent,
  closed: handleIssueEvent,
  reopened: handleIssueEvent,
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

function tagRefIssue(tags, issueInfo) {
  const repoName = issueInfo.repoFullName;
  const issueNum = issueInfo.issueNumber;

  return model.Project.findByName(repoName)
    .then(function (prj) {
      if (prj) {
        return model.Issue.tagIssueByNumber(prj, tags, issueNum);
      }
    });
}

/**
 * Applying tags to the given issue.
 * @param refPrj [Project] the project which the issue belongs to, or just referenced by
 */
function tagIssue(refPrj, tags, issueInfo) {
  console.log('tagging issue prj#%s', refPrj.id, issueInfo, tags);
  var p;
  if (issueInfo.repoFullName) {
    // the issue is from another repo
    p = tagRefIssue(tags, issueInfo);
  } else {
    p = model.Issue.tagIssueByNumber(refPrj, tags, issueInfo.issueNumber);
  }

  return p.then(function () {
    // applying labels back to GitHub issue
    var info = issueInfo;
    if (!issueInfo.repoFullName) {
      info = R.assoc('repoFullName', refPrj.get('name'), issueInfo);
    }

    gh.applyLabels(refPrj.get('ghAccessToken'), tags, info);
  });
}

exports.onIssuesEvent = onIssuesEvent;
exports.tagIssue = tagIssue;
