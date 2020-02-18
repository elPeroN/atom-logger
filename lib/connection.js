const user = require('./user.js');
const session = require('./session.js');

let currentSession = new session.Collection();

function rememberMe() {
  let _id = localStorage.getItem('logger_id');
  let _psw = localStorage.getItem('logger_psw');

  if ( _id != "" && _psw != ""){
    login(_id, _psw, true);
    return true;
  }
  else {
    return false;
  }
}

function login(_id, _psw,_rem) {

  let REQ = new XMLHttpRequest(), FD = new FormData();

  FD.append('email', _id);
  FD.append('password', _psw);

  //Richiesta formulata correttamente
  REQ.onload = function() {
      //Login avvenuto correttamente
      if (REQ.status === 200) {
        let tmp_user = new user.User(_id, (JSON.parse(REQ.response).token));
        currentSession.setUsr(tmp_user);
        alert("logged in as "+_id+"!");
        //Salvare credenziali se la checkbox era segnata
        if (_rem) {
          localStorage.setItem('logger_id', _id);
          localStorage.setItem('logger_psw', _psw);
        }
        sessionStorage.setItem('logger_token', currentSession.getUsr().getToken() );
      }
      //Login fallito
      else {
        alert("Failed "+REQ.status+" "+JSON.parse(REQ.response).message)
      }

  }
  //Richiesta malposta
  REQ.onerror = function() {
      alert("Bad request "+REQ.status+" "+REQ.response);
  }

  REQ.open('POST', currentSession.getServer(), true);

  REQ.send(FD);
}
function logout() {

}
function post() {

}

module.exports = {
  login: login,
  logout: logout,
  post: post,
  remember: rememberMe,
}
