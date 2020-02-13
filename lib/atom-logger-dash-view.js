'use babel';
import Stopwatch from './stopwatch';

export default class AtomLoggerDashView {

  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('atom-logger');
    this.element.classList.add('native-key-bindings');

    let title = document.createElement('h2');
    title.textContent = 'Atom-Logger Dash';
    this.element.appendChild(title);

    let container = document.createElement('div');
    this.element.appendChild(container);

    let clock = document.createElement('h2');
    let timer = new Stopwatch(clock);
    container.appendChild(clock);

    this.start = document.createElement('button');
    this.start.textContent = 'start';
    container.appendChild(this.start);

    this.start.addEventListener('click', () => {
      timer.start();
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
