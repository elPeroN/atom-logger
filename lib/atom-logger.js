'use babel';

import LoginView from './login-view';
import DashView from './dash-view';
import Database from './db/Database';
import Metric from './metrics/Metric';
import CodeMetric from './metrics/CodeMetric';

import { CompositeDisposable } from 'atom';

var db = new Database();

export default {

  atomLoggerLoginView: null,
  atomLoggerDashView:null,
  panel: null,
  dashPanel: null,
  subscriptions: null,
  active:null,

  activate(state) {

    this.codeMetrics = [];
    this.earlyStartup();

    this.atomLoggerLoginView = new LoginView(state.atomLoggerLoginViewState);
    this.atomLoggerDashView = new DashView(state.atomLoggerDashViewState);

    this.dashPanel = atom.workspace.addRightPanel({
      item: this.atomLoggerDashView.getElement(),
      visible: false
     });

    this.panel = atom.workspace.addRightPanel({
      item: this.atomLoggerLoginView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-logger:toggle': () => this.toggle()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-logger:showDash': () => this.showDash()
    }));
  },

  deactivate() {
    this.panel.destroy();
    this.subscriptions.dispose();
    this.LoginView.destroy();
  },

  serialize() {},

  showDash() {
    return (
      this.dashPanel.isVisible() ?
      this.dashPanel.hide() :
      this.dashPanel.show()
    );
  },

  toggle() {
    return (
      this.panel.isVisible() ?
      this.panel.hide() :
      this.panel.show()
    );
  },

  consumeStatusBar (statusBar){
    var tile = document.createElement('a');
    tile.className = 'line-ending-tile inline-block';
    tile.textContent = 'Atom-Logger';
    statusBar.addRightTile({item: tile, priority: 1});

    tile.addEventListener('click', () => {
      this.toggle();
    })
  },

  earlyStartup() {
    this.sendOfflineData();
    this.addPageListener(atom.workspace);
    this.addCodeListener(atom.workspace.getActiveTextEditor());
    this.checkUnsendData();
  },

  checkUnsendData(){
    this.interval = setInterval(() => {
      this.sendOfflineData();
    }, 10000);
  },

  sendOfflineData(){
    //var db = Database.getDB();
		var metrics = db.getMetrics();
		if (!metrics[0]) {
			return;
		}
		if (Server.getInstance().sendMetrics(metrics)) {
			db.deleteMetrics(metrics);
		}
  },

  saveMetric(metric){
    //var db = Database.getDB();
    db.insertNewMetric(metric);
  },

  storeNewMetric(name) {
    if (this.metric == null) {
      this.metric = new Metric(name);
    } else {
      this.metric.finish();
      this.saveMetric(this.metric);
      this.metric = new Metric(name);
    }
  },

  stopMetric() {
    if (this.metric != null) {
      this.metric.finish();
      this.saveMetric(this.metric);
      this.metric = null;
    }
  },

  storeNewCodeMetric(fileName, code) {
    var codeMetric = this.codeMetrics[fileName];
    if (!codeMetric) {
      codeMetric = new CodeMetric(fileName, code);
    } else {
      var metrics = codeMetric.finish(code);
      if (metrics.length > 0) {
        for (var metric in metrics) {
          this.saveMetric(metric);
        }
        codeMetric = new CodeMetric(fileName, code);
      }
    }
    this.codeMetrics[fileName] = codeMetric;
  },

  addPageListener(page) {
    page.onDidChangeActiveTextEditor(() => {
      if(atom.workspace.getActiveTextEditor()){
        this.storeNewMetric(atom.workspace.getActiveTextEditor().getTitle());
        this.addCodeListener(atom.workspace.getActiveTextEditor());
      }
    })
  },

  addCodeListener(part) {
    //verificare altri listener IPropertyListener
    part.onDidSave(() => {
      var title = part.getTitle();
      var text = part.getText();
      this.storeNewCodeMetric(title, text);
    })
  }
}
