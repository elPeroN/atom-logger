'use babel';

import atomLogger from './atom-logger'
import Credentials from './server/Credentials';

export default class LoginView {

  constructor() {
    // Create root element
    this.element = document.createElement('atom-panel');
    this.element.className = 'modal';

    var inset = document.createElement('div');
    inset.classList.add('inset-panel');
    inset.classList.add('native-key-bindings');
    this.element.appendChild(inset);

    let title = document.createElement('div');
    title.className = 'panel-heading icon-person';
    title.textContent = ' Atom-Logger Login';
    inset.appendChild(title);

    let cross = document.createElement('button');
    cross.className = 'btn icon icon-x atom-logger-close';
    inset.appendChild(cross);

    let container = document.createElement('form');
    container.className = 'inline-block text-highlight';

    inset.appendChild(container);

    let username = document.createElement('input');
    username.className = 'input-text atom-logger-textfield';
    username.autofocus = true;
    username.tabIndex = 0;
    username.type = 'text';
    username.placeholder = 'E-mail';
    username.name = 'username';
    username.required = true;
    container.appendChild(username);

    let password = document.createElement('input');
    password.className = 'input-text atom-logger-textfield';
    password.tabIndex = 1;
    password.type = 'password';
    password.placeholder = 'Password';
    password.name = 'password';
    password.required = true;
    container.appendChild(password);

    let protocol = document.createElement('select');
    protocol.className = 'input-text atom-logger-select';
    let http = document.createElement('option');
    http.value='http://';
    http.innerHTML = 'HTTP';
    let https = document.createElement('option');
    https.value='https://';
    https.innerHTML = 'HTTPS';
    if (atom.config.get('atom-logger.protocol') == 'HTTP'){
      http.selected = true;
    }else{
      https.selected =true;
    }
    protocol.appendChild(http);
    protocol.appendChild(https);
    container.appendChild(protocol);

    let server = document.createElement('input');
    server.className = 'input-text atom-logger-textfieldServer';
    server.tabIndex = 2;
    server.type = 'server';
    server.placeholder = 'Server';
    if (atom.config.get('atom-logger.serverAddress') != '')
      server.value = atom.config.get('atom-logger.serverAddress');

    server.name = 'Server';
    server.required = true;
    container.appendChild(server);

    let submit = document.createElement('button');
    submit.className = 'btn atom-logger-button';
    submit.type = 'submit';
    submit.textContent = 'Login';
    container.appendChild(submit);

    this.element.addEventListener('submit', () =>{
      atomLogger.server.authenticate(new Credentials(protocol.value, server.value, username.value, password.value), atom.config.get('atom-logger.remember')).then(() => {
        atomLogger.auth = true;
        atom.config.set('atom-logger.protocol', protocol.value);
        atom.config.set('atom-logger.serverAddress', server.value);
        atomLogger.icon.classList.remove('text-error');
        atomLogger.icon.classList.add('text-success');
        atomLogger.dashView.loginPanel.destroy();
        atomLogger.dashView.statsContainer.innerHTML = '';
        atomLogger.dashView.createStats();
        atomLogger.server.getStatistics().then((stats)=>{
          atomLogger.dashView.refreshStats(stats);
        }, rejected => {});
        atomLogger.sendOfflineData();
        atomLogger.inter = setInterval( () => atomLogger.sendOfflineData(), atom.config.get('atom-logger.refreshTime')*1000);
      })
    })

    cross.addEventListener('click', () => {
      atomLogger.dashView.loginPanel.destroy();
      atomLogger.dashView.loginButton.disabled = false;
    })
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
