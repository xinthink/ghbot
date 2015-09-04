/*global AV */

const User = AV.Object.extend('_User', {
  // instance methods

  update: function (data) {
    this.set('ghId', data.id);
    this.set('username', data.login);
    this.set('displayName', data.login);
    this.set('avatarUrl', data.avatar_url);
    this.set('url', data.html_url);
    this.set('project', data.project);
    this.set('password', '123456');
    return this.save();
  },

}, {
  // static methods


  createOrUpdate: function (data) {
    if (!data) {
      return undefined;
    }

    return new AV.Query(User)
      .equalTo('ghId', data.id)
      .first()
      .then(function (user) {
        return (user || new User()).update(data);
      });
  },
});

module.exports = User;
