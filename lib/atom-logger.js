'use babel';

import LoginView from './login-view';
import DashView from './dash-view';
import Database from './db/Database';
import Metric from './metrics/Metric';
import CodeMetric from './metrics/CodeMetric';
import Session from './metrics/Session';
import Server from './server/Server';
import GetNetworkAddress from './utils/GetNetworkAddress';
import { CompositeDisposable } from 'atom';

var server;
var session;

export default {

  //atomLoggerLoginView: null,
  dashView:null,
  panel: null,
  subscriptions: null,
  db:null,
  server:null,
  auth:null,

  async activate(state) {
    //var gna = new GetNetworkAddress();
    //var res = gna.GetAddress();
    this.db = new Database();
    var date = new Date();
    session = new Session('1', '2');
    this.server = new Server(this.db);
    this.codeMetrics = [];

    this.dashView = new DashView();

    this.panel = atom.workspace.addRightPanel({
      item: this.dashView.getElement(),
      visible: false
     });

    this.earlyStartup();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-logger:dashboard': () => this.showDash()
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
      this.showDash();
    })
  },

  earlyStartup() {
    this.dashView.startSession();
    this.sendOfflineData();
    this.addPageListener(atom.workspace);
    this.addCodeListener(atom.workspace.getActiveTextEditor());
    this.checkUnsendData();
  },

  checkUnsendData(){
    this.interval = setInterval(() => {
      this.sendOfflineData();
    }, 100000);
  },

  async sendOfflineData(){
    //var db = Database.getDB();
		var metrics = await this.db.getMetrics();
    console.log(metrics);
		if (!metrics[0]) {
			return;
		}
		if (this.server.sendMetrics(metrics)) {
			this.db.deleteMetrics(metrics);
		}
  },

  saveMetric(metric){
    //var db = Database.getDB();
    this.db.insertNewMetric(metric);
  },

  storeNewMetric(name) {
    if (this.metric == null) {
      this.metric = new Metric(null,name,new Date(),null,"eclipse_tab_name","", session);
    } else {
      this.metric.finish();
      this.saveMetric(this.metric);
      this.metric = new Metric(null,name,new Date(),null,"eclipse_tab_name","", session);
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
      codeMetric = new CodeMetric(fileName, session, code);
    } else {
      var metrics = codeMetric.finish(code);
      if (metrics.length > 0) {
        for (var metric in metrics) {
          this.saveMetric(metric);
        }
        codeMetric = new CodeMetric(fileName, session, code);
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
