'use babel';

import Credentials from './server/Credentials';
import AtomLogger from './atom-logger';

export default class LoginView {

  constructor() {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-logger');
    this.element.classList.add('native-key-bindings');

    let title = document.createElement('h2');
    title.className = 'atom-logger-title';
    title.textContent = 'Atom-Logger Login';
    this.element.appendChild(title);

    let cross = document.createElement('span');
    cross.className = 'icon icon-x atom-logger-close';
    this.element.appendChild(cross);

    let container = document.createElement('form');
    this.element.onsubmit = function() {
      AtomLogger.server.authenticate(new Credentials(server.value, username.value, password.value), remember.checked).then(() => {
        console.log("autenticato!");
        AtomLogger.dashView.loginButton.textContent = 'Logout';
        AtomLogger.dashView.status.style.color = 'green';
        AtomLogger.dashView.loginPanel.destroy();
      })
    }
    this.element.appendChild(container);

    let server = document.createElement('input');
    server.className = 'atom-logger-textfield';
    server.type = 'text';
    server.placeholder = 'server';
    server.name = 'server';
    server.required = true;
    container.appendChild(server);

    let username = document.createElement('input');
    username.className = 'atom-logger-textfield';
    username.type = 'text';
    username.placeholder = 'Username';
    username.name = 'username';
    username.required = true;
    container.appendChild(username);

    let password = document.createElement('input');
    password.className = 'atom-logger-textfield';
    password.type = 'password';
    password.placeholder = 'Password';
    password.name = 'password';
    password.required = true;
    container.appendChild(password);

    let submit = document.createElement('button');
    submit.className = 'atom-logger-button';
    submit.type = 'submit';
    submit.textContent = 'Login';
    container.appendChild(submit);

    let remember = document.createElement('input');
    remember.type = 'checkbox';
    container.appendChild(remember);

    let rememberText = document.createElement('label');
    rememberText.textContent = 'Remember me';
    container.appendChild(rememberText);

    cross.addEventListener('click', () => {
      AtomLogger.dashView.loginPanel.destroy();
      AtomLogger.dashView.loginButton.disabled = false;
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
