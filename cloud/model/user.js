/*global AV */

const User = AV.Object.extend('_User', {
  // instance methods

  update: function (data) {
    this.set('ghId', data.id);
    this.set('username', data.login);
    this.set('displayName', data.name || data.login);
    this.set('avatarUrl', data.avatar_url);
    this.set('url', data.html_url);
    this.set('password', '123456');

    if (data.email) {
      this.set('email', data.email);
    }

    if (data.accessToken) {
      this.set('ghAccessToken', data.accessToken);
    }

    if (data.refreshToken) {
      this.set('ghRefreshToken', data.refreshToken);
    }

    return this.save();
  },

}, {
  // static methods

  findById: function (uid) {
    return new AV.Query(User).get(uid);
  },

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
