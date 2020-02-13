'use babel';

export default class AtomLoggerLoginView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-logger');
    this.element.classList.add('native-key-bindings');

    let title = document.createElement('h2');
    title.textContent = 'Atom-Logger Login';
    this.element.appendChild(title);

    let container = document.createElement('form');
    //inserire action e method//
    this.element.appendChild(container);

    let username = document.createElement('input');
    username.type = 'text';
    username.placeholder = 'Username';
    username.name = 'username';
    username.required = true;
    container.appendChild(username);

    let password = document.createElement('input');
    password.type = 'password';
    password.placeholder = 'Password';
    password.name = 'password';
    password.required = true;
    container.appendChild(password);

    let submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Login';
    container.appendChild(submit);

    let remember = document.createElement('input');
    remember.type = 'checkbox';
    container.appendChild(remember);

    let rememberText = document.createElement('label');
    rememberText.textContent = 'Remember me';
    container.appendChild(rememberText);
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