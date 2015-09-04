/*global AV */

const Milestone = AV.Object.extend('Milestone', {
  // instance methods

  update: function (data) {
    this.set('ghId', data.id);
    this.set('name', data.title);
    this.set('desc', data.description);
    this.set('closedAt', data.closed_at ? new Date(data.closed_at) : undefined);
    this.set('deadline', data.due_on ? new Date(data.due_on) : undefined);
    // this.set('startAt', data.);
    this.set('url', data.html_url);
    this.set('status', data.state);
    this.set('project', data.project);
    return this.save();
  },

}, {
  // static methods

  createOrUpdate: function (data) {
    if (!data) {
      return undefined;
    }

    return new AV.Query(Milestone)
      .equalTo('ghId', data.id)
      .first()
      .then(function (ms) {
        return (ms || new Milestone()).update(data);
      });
  },
});

module.exports = Milestone;
