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

	this.db = new Database();
	let address = await GetNetworkAddress.getAddress();
	this.currentSession = new Session(address.ipAddr, address.macAddr);
	this.server = new Server();
	this.codeMetrics = [];
  this.dashView = new DashView();
	this.earlyStartup();


    this.panel = atom.workspace.addRightPanel({
      item: this.dashView.getElement(),
      visible: false
     });


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
    if (atom.workspace.getActiveTextEditor()) {
      this.addCodeListener(atom.workspace.getActiveTextEditor());
    }
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

		var metrics = await this.db.getMetrics();
		if (!metrics[0]) {
			return;
		}
		if (server.sendMetrics(metrics)) {
			this.db.deleteMetrics(metrics);
    }
  },

	storeNewMetric(name) {
		if (this.metric == null) {
			this.metric = new Metric(null,name);
		}else{
			this.metric.finish();
			this.db.insertNewMetric(this.metric);
			this.metric = new Metric(null,name);
		}
	},

	stopMetric() {
		if(this.metric != null){
			this.metric.finish();
			this.db.insertNewMetric(metric);
			this.metric = null;
		}
	},

	storeNewCodeMetric(fileName, code) {
		var codeMetric = this.codeMetrics[fileName];
		if(codeMetric) {
			var metrics = codeMetric.finish(code);
			for (var i in metrics) this.db.insertNewMetric(metrics[i]);
		}

		this.codeMetrics[fileName] = new CodeMetric(fileName, code);
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
    var fun = () => {
      this.storeNewCodeMetric(part.getTitle(), part.getText());
    }
    fun();
    //verificare altri listener IPropertyListener
    part.onDidSave(fun);
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
      clearInterval(this.interval);
      this.checkUnsendData(atom.config.get('atom-logger.refreshTime')*1000);
    })
  }
}
