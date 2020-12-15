'use babel';
import Stopwatch from './stopwatch';
import atomLogger from './atom-logger';
import LoginView from './login-view';
import ChartView from './chart-view';

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

    let unsentmetric = document.createElement('div');
    unsentmetric.className = 'block';
    sessionContainer.appendChild(unsentmetric);

    let unsendCount = document.createElement('div');
    unsendCount.className = 'inline-block'
    unsendCount.textContent = 'Unsent Metrics';
    unsentmetric.appendChild(unsendCount);

    this.counter = document.createElement('span');
    this.counter.className = 'inline-block badge badge-warning icon-database';
    this.counter.textContent = atomLogger.unsentmetric;
    unsentmetric.appendChild(this.counter);

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

    let statisticsLabel = document.createElement('label');
    statisticsLabel.className = 'icon icon-graph atom-logger-label';
    statisticsLabel.textContent = 'Statistics';
    this.element.appendChild(statisticsLabel);

    this.statsContainer = document.createElement('div');
    this.statsContainer.className = 'inset-panel padded';
    this.element.appendChild(this.statsContainer);

    var settings = document.createElement('button');
    settings.className = 'btn icon-gear atom-logger-settings';
    this.element.appendChild(settings);

    cross.addEventListener('click', () => {
      atomLogger.panel.hide();
    })

    settings.addEventListener('click', () => {
      atom.workspace.open('atom://config/packages/atom-logger');
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


  createWarning() {
    var warning = document.createElement('div');
    warning.className = 'atom-logger-warning';

    let sessionLabel = document.createElement('label');
    sessionLabel.className = 'icon icon-issue-opened atom-logger-warning';
    warning.appendChild(sessionLabel);

    let message = document.createElement('label');
    message.className = 'atom-logger-warning';
    message.textContent = 'You are not logged';
    warning.appendChild(message);

    this.loginButton = document.createElement('button');
    this.loginButton.className = 'inline-block btn atom-logger-button';
    this.loginButton.textContent = 'Login';
    warning.appendChild(this.loginButton);

    this.statsContainer.appendChild(warning);

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

  createStats() {
    this.lineChart = new ChartView('Lines');
    this.statsContainer.appendChild(this.lineChart.getElement());

    this.commChart = new ChartView('Comments');
    this.statsContainer.appendChild(this.commChart.getElement());

    this.testChart = new ChartView('Tests');
    this.statsContainer.appendChild(this.testChart.getElement());

    var buttonDiv = document.createElement('div');
    buttonDiv.className = 'inline-block atom-logger-logout';
    this.element.appendChild(buttonDiv);

    var logoutButton = document.createElement('button');
    logoutButton.id = 'logout';
    logoutButton.innerHTML = "Logout";
    logoutButton.className = 'inline-block btn';
    buttonDiv.appendChild(logoutButton);

    var downloadButton = document.createElement('button');
    downloadButton.id = 'logout';
    downloadButton.innerHTML = "Download Stats";
    downloadButton.className = 'inline-block btn';
    buttonDiv.appendChild(downloadButton);

    downloadButton.addEventListener('click', () =>{
      downloadButton.innerHTML = "DOWNLOADING ...";
      downloadButton.disabled = true;
      atomLogger.server.getStatistics()
         .then(stats => {
           var json = JSON.stringify(stats);
           var blob = new Blob([json], {type: "application/json"});

           var a = document.createElement('a');
           a.href = window.URL.createObjectURL(blob);
           a.download = "loggerStats.json";
           a.dispatchEvent(new MouseEvent('click'));
           downloadButton.disabled = false;
           downloadButton.innerHTML = "Download Stats";
         })
    })

    logoutButton.addEventListener('click', () => {
      atomLogger.logout();
    })


  }

  refreshStats(stats) {
    this.lines = {
      inserted : 0,
      deleted: 0,
      modified: 0,
    }

    this.comments = {
      inserted : 0,
      deleted: 0,
    }

    this.tests = {
      inserted : 0,
      deleted: 0,
    }

    stats.forEach((item) => {
      if(item.activity_type.includes('lines_insert')) this.lines.inserted++;
      else if (item.activity_type.includes('lines_delete')) this.lines.deleted++;
      else if (item.activity_type.includes('lines_change')) this.lines.modified++;
      else if (item.activity_type.includes('comments_added')) this.comments.inserted++;
      else if (item.activity_type.includes('comments_deleted')) this.comments.deleted++;
      else if (item.activity_type.includes('tests_added')) this.tests.inserted++;
      else if (item.activity_type.includes('tests_deleted')) this.tests.deleted++;
    });
    this.lineChart.update(this.lines);
    this.commChart.update(this.comments);
    this.testChart.update(this.tests);
  }
}
