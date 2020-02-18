function User(_id, _tok) {
  var username = _id;
  var token = _tok;

  this.getName = function() {
    return username;
  }
  this.getToken = function() {
    return token;
  }
  this.setToken = function(_tok) {
    token = _tok;
  }
}

module.exports.User = User;
