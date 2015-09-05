const Q = require('q');
const R = require('ramda');
const model = require('cloud/model');
const issueSvc = require('cloud/service').issue;

// Matching `t:done, demo #1, user/repo#3`
const ACT_MSG_REG = /(^|\s)t:((\s*,\s*)?[-_\w\d\.\/]+)+\s+((\s*,\s*)?([-_\w\d\.\/]+)?#\d+)+/i;
const ACT_MSG_MTC = /(?:^|\s)t:((?:(?:\s*,\s*)?[-_\w\d\.\/]+)+)\s+((?:(?:\s*,\s*)?(?:[-_\w\d\.\/]+)?#\d+)+)/i;

function hasActableMessage(commit) {
  const result = ACT_MSG_REG.test(commit.message);
  console.log('message "%s" is actionable? %s', commit.message, result);
  return result;
}

function extractTaggings(taggings, msg) {
  console.log('extractTaggings from', msg);
  const mt = ACT_MSG_MTC.exec(msg);
  if (!mt) {
    return;
  }

  taggings.push({
    tags: mt[1],
    issues: mt[2],
  });

  const next = mt.index + mt[0].length;
  extractTaggings(taggings, msg.substr(next));
}

function _parseIssueRef(ref) {
  const mt = /(.*)#(\d+)/.exec(ref);
  return {
    repoFullName: mt[1],
    issueNumber: parseInt(mt[2]),
  };
}

const compact = R.reject(R.isEmpty);
const parseIssueRef = R.map(_parseIssueRef);

// [ { tags: 'done,demo', issues: '#11, #13' },
//   { tags: 'draft', issues: '#12, #10' } ]
function doTagIssues(prj, tagging) {
  const tags = compact(tagging.tags.split(/\s*,\s*/));
  const issues = parseIssueRef(compact(tagging.issues.split(/\s*,\s*/)));
  const tagFunc = R.partial(issueSvc.tagIssue, prj, tags);
  return Q.all(R.map(tagFunc, issues));
}

function tagIssues(taggings, prj) {
  return Q.all(R.map(R.partial(doTagIssues, prj), taggings));
}

function handleCommit(prjId, commit) {
  const taggings = [];
  extractTaggings(taggings, commit.message);
  console.log('will do the tagging', taggings, prjId);

  return model.Project.findById(prjId).then(R.partial(tagIssues, taggings));
}

function onCommits(prjId, commits) {
  const eligibleCommits = R.filter(hasActableMessage, commits);
  const commitHandler = R.partial(handleCommit, prjId);
  return Q.all(R.map(commitHandler, eligibleCommits));
}

function onPush(prjId, event) {
  const commits = event.commits;
  if (!(commits && commits.length)) {
    return Q();
  }

  return onCommits(prjId, commits)
    .fail(function (err) {
      console.error('commits handler failed', err);
    });
}

exports.onPush = onPush;
