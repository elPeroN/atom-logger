'use babel';
import Stopwatch from './stopwatch';
import atomLogger from './atom-logger';
import LoginView from './login-view';
import ChartView from './chart-view';
//var Chart = require('chart.js');

export default class DashView {

  constructor() {

    this.session = false;

    this.element = document.createElement('atom-panel');
    this.element.className = 'padded atom-logger';

    this.title = document.createElement('div');
    this.title.className = 'atom-logger-title icon-dashboard inline-block';
    this.title.textContent = ' Atom-Logger DashBoard';
    this.element.appendChild(this.title);

    let cross = document.createElement('div');
    cross.className = 'icon icon-x atom-logger-close-panel';
    this.element.appendChild(cross);

    let sessionLabel = document.createElement('label');
    sessionLabel.className = 'icon icon-flame atom-logger-label';
    sessionLabel.textContent = 'Current Session';
    this.element.appendChild(sessionLabel);


    let sessionContainer = document.createElement('div');
    sessionContainer.className = 'inset-panel padded';
    this.element.appendChild(sessionContainer);

    //session tab
    let unsendMetric = document.createElement('div');
    unsendMetric.className = 'block';
    sessionContainer.appendChild(unsendMetric);

    let unsendCount = document.createElement('div');
    unsendCount.className = 'inline-block'
    unsendCount.textContent = 'Unsend Metrics';
    unsendMetric.appendChild(unsendCount);

    this.counter = document.createElement('span');
    this.counter.className = 'inline-block badge badge-warning icon-database';
    this.counter.textContent = '0';
    unsendMetric.appendChild(this.counter);

    let time = document.createElement('div');
    time.className ='atom-logger-line';
    time.className = 'block';
    sessionContainer.appendChild(time);

    let sessionTime = document.createElement('div');
    sessionTime.className = 'inline-block'
    sessionTime.textContent = 'Session Time';
    time.appendChild(sessionTime);

    let clock = document.createElement('div');
    this.timer = new Stopwatch(clock);
    time.appendChild(clock);

    let weeklyLabel = document.createElement('label');
    weeklyLabel.className = 'icon icon-graph atom-logger-label';
    weeklyLabel.textContent = 'Weekly stats';
    this.element.appendChild(weeklyLabel);

    this.weeklyContainer = document.createElement('div');
    this.weeklyContainer.className = 'inset-panel padded';
    this.element.appendChild(this.weeklyContainer);

    cross.addEventListener('click', () => {
      atomLogger.panel.hide();
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

  async startSession() {
    this.timer.start();
    var metrics = await atomLogger.db.getMetrics();
    this.counter.textContent = metrics.length;

    atomLogger.auth = await atomLogger.server.isAuthenticated();
    if(atomLogger.auth){
      atomLogger.icon.classList.add('text-success');
      this.createWeekly();
    }else{
      atomLogger.icon.classList.add('text-error');
      this.createWarning()
    }
  }

  createWarning() {
    var warning = document.createElement('div');
    warning.className = 'atom-logger-warning';

    let sessionLabel = document.createElement('label');
    sessionLabel.className = 'icon icon-issue-opened atom-logger-warning';
    warning.appendChild(sessionLabel);

    let message = document.createElement('label');
    message.className = 'atom-logger-warning';
    message.textContent = 'To see your metrics needs to be logged';
    warning.appendChild(message);

    this.loginButton = document.createElement('button');
    this.loginButton.className = 'inline-block btn';
    this.loginButton.textContent = 'Login';
    warning.appendChild(this.loginButton);

    this.weeklyContainer.appendChild(warning);

    this.loginButton.addEventListener('click', () => {
      this.loginButton.disabled = 'true';
      var loginView = new LoginView();
      this.loginPanel = atom.workspace.addModalPanel({
        item: loginView.getElement(),
        visible: false
       });
      this.loginPanel.show();
    });
  }

  async createWeekly() {
    var statistics = await atomLogger.server.getStatistics();
    //statistics.filter(o => o.includes(''))
    console.log(statistics);
    var lines = {
      added : 57,
      deleted : 175,
      modified : 26
    };

    var comments = {
      added : 34,
      deleted : 15
    }

    var tests = {
      added : 3,
      deleted : 1
    }
    var lineChart = new ChartView('Code changes', lines);
    this.weeklyContainer.appendChild(lineChart.getElement());

    var commChart = new ChartView('Comment changes', comments);
    this.weeklyContainer.appendChild(commChart.getElement());

    var testChart = new ChartView('Test changes', tests);
    this.weeklyContainer.appendChild(testChart.getElement());

    var steTest = document.createElement('button');
    steTest.className = 'btn';
    steTest.textContent = 'SteTest';
    this.weeklyContainer.appendChild(steTest);

    steTest.addEventListener('click', () => {
      lines.deleted += 10;
      lines.added += 30;
      lineChart.update(lines);
    })
  }
}
