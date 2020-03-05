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

	//atomLoggerLoginView: null,
	dashView:null,
	panel: null,
	subscriptions: null,
	auth:null,
	db:null,
	server:null,
	currentSession:null,


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
		metrics = this.db.getMetrics();

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
		//verificare altri listener IPropertyListener
		part.onDidSave(() => {
			var title = part.getTitle();
			var text = part.getText();
			this.storeNewCodeMetric(title, text);
		})
	}
}
