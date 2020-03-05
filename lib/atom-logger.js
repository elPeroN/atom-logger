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

export default {

  dashView:null,
  panel: null,
  subscriptions: null,
  db:null,
  server:null,
  auth:null,
  config: {
    serverAddress: {
      'type': 'string',
      'default': '',
      'title': 'Server Address',
      'description': 'Insert Server you want to connect to'
    },
    refreshTime: {
      'type': 'string',
      'default': '100',
      'title': 'Refresh Time (sec)',
      'description': 'Select how often metrics are sent to the server',
      'enum': [
        '1',
        '100',
        '1000'
      ]
    },
    remember: {
      'type': 'boolean',
      'default': 'false',
      'title': 'Auto Authentication',
      'description': 'Select if you want plugin should remember your access',
    }
  },

  async activate(state) {
    var x = await GetNetworkAddress.GetAddress();
    this.db = new Database();
    var date = new Date();
    session = new Session(x.ipAddr, x.macAddr);
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
    let tile = document.createElement('div');
    tile.className = 'line-ending-tile inline-block';

    var name = document.createElement('a');
    name.textContent = 'Atom-Logger';

    this.icon = document.createElement('div');
    this.icon.className = 'icon icon-cloud-upload atom-logger-icon'
    tile.appendChild(this.icon);
    tile.appendChild(name);

    statusBar.addRightTile({item: tile, priority: 1});

    tile.addEventListener('click', () => {
      this.showDash();
    })
  },

  earlyStartup() {
    this.sendOfflineData();
    this.addPageListener(atom.workspace);
    this.addCodeListener(atom.workspace.getActiveTextEditor());
    //atom.commands.findCommands();
    this.addCommandsListener();
    this.checkUnsendData(atom.config.get('atom-logger.refreshTime')*1000);
    this.addConfigListener();
    this.dashView.startSession();
  },

  checkUnsendData(timer){
    this.interval = setInterval(() => {
      this.sendOfflineData();
    }, timer);
  },

	async sendOfflineData(){
		//var db = Database.getDB();
		var metrics = await this.db.getMetrics();
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
  },

  addCommandsListener() {
    atom.commands.onDidDispatch((event) =>{
        if(!event.type.startsWith('core')){
          this.storeNewMetric(event.type);
        }
    })
  },

  addConfigListener() {
    atom.config.onDidChange('atom-logger.refreshTime', () => {
      console.log('ciao');
      clearInterval(this.interval);
      this.checkUnsendData(atom.config.get('atom-logger.refreshTime')*1000);
    })
  }
}
