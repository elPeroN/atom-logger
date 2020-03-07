'use babel';

import Credentials from './server/Credentials';
import atomLogger from './atom-logger'

export default class LoginView {

  constructor() {
    // Create root element
    this.element = document.createElement('atom-panel');
    this.element.className = 'modal';

    var inset = document.createElement('div');
    inset.classList.add('inset-panel');
    //inset.classList.add('atom-logger block');
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
    this.element.onsubmit = function() {
      atomLogger.server.authenticate(new Credentials(atom.config.get('atom-logger.serverAddress'), username.value, password.value), atom.config.get('atom-logger.remember')).then(() => {
        atomLogger.auth = true;
        atomLogger.icon.classList.remove('text-error');
        atomLogger.icon.classList.add('text-success');
        atomLogger.dashView.loginPanel.destroy();
        atomLogger.dashView.weeklyContainer.innerHTML = '';
        atomLogger.dashView.createWeekly();
        atom.notifications.addSuccess('Successfully Logged in');
      })
    }
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

    let submit = document.createElement('button');
    submit.className = 'btn atom-logger-button';
    submit.type = 'submit';
    submit.textContent = 'Login';
    container.appendChild(submit);

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
