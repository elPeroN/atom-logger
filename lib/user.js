function User(_id, _psw, _tok) {
  var username = _id;
  var password = _psw
  var token = _tok;

  this.getName = function() {
    return username;
  }
  this.getPsw = function() {
    return password;
  }
  this.getToken = function() {
    return token;
  }
  this.setToken = function(_tok) {
    token = _tok;
  }
}

module.exports.User = User;
