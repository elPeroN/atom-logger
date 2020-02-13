'use babel';

export default class Stopwatch{

  constructor(div) {
    this.div = div;
    this.div.textContent = '00:00:00';
    this.time = 0;
    this.interval;
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

  start() {
    var temp = this;
    this.interval = setInterval(function () {
      temp.time++;
      temp.timer();
    }, 1000);
  }

  stop() {
    clearInterval(this.interval);
  }

  timer() {
    this.div.textContent = Math.floor(this.time/3600) + ':' + Math.floor((this.time%3600)/60) + ':' + Math.floor((this.time%3600)%60);
  }
}
