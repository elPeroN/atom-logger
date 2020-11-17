'use babel';

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
    protocol: {
      'type': 'string',
      'title': 'Server Protocol',
      'default': 'HTTP',
      'description' : 'Insert server protocol',
      'enum' : [
        'HTTP',
        'HTTPS'
      ]
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

  activate(state) {

    this.dashView = new DashView();

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
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-logger:logout': () => this.logout()
    }));

    this.earlyStartup();
  },

  deactivate() {
    this.panel.destroy();
    this.subscriptions.dispose();
    this.dashView.destroy();
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

  async earlyStartup() {
    this.db = new Database();
    this.server = new Server();

    this.db.getMetrics().then((metrics) => {
      this.dashView.counter.textContent = metrics.length;
    }, noMetrics => {
      this.dashView.counter.textContent = "0";
    });
    this.dashView.timer.start();


    let address = GetNetworkAddress.getAddress().then((address) =>{
        this.session = new Session(address.ipAddr, address.macAddr);
        this.db.getAddr().then((add) => {
          this.server.addr = add;
          this.db.getToken(add).then( token => {
            this.server.token = token;
            this.server.getStatistics().then( stats =>{
              this.icon.classList.add('text-success');
              this.dashView.createStats();
              this.dashView.refreshStats(stats);
              this.checkUnsendData(atom.config.get('atom-logger.refreshTime')*1000);
            }, rejected => {
              this.icon.classList.add('text-error');
              this.dashView.createWarning();
              atom.notifications.addWarning("ATOM-LOGGER - Token expired, please log in")
              this.db.deleteToken();
            });
          }, noToken => {
            this.icon.classList.add('text-error');
            this.dashView.createWarning();
          });
        });
    });
    this.codeMetrics = [];

    this.addPageListener(atom.workspace);
    if (atom.workspace.getActiveTextEditor()) {
      this.addCodeListener(atom.workspace.getActiveTextEditor());
    }
    this.addCommandsListener();
    this.addConfigListener();

  },

  checkUnsendData(timer){
    this.interval = setInterval(() => {
      this.sendOfflineData();
    }(), timer);
  },

  sendOfflineData(){
		this.db.getMetrics().then(metrics =>{
      this.server.sendMetrics(metrics).then( sended => {
        this.db.deleteMetrics(metrics);
        this.dashView.counter.textContent = '0';
        this.server.getStatistics().then((stats) =>{
          this.dashView.refreshStats(stats);
        });
      }, rejected => {
        this.dashView.statsContainer.innerHTML = '';
        this.icon.classList.remove('text-success');
        this.icon.classList.add('text-error');
        this.dashView.createWarning();
        this.server.token = null;
        this.db.deleteToken();
        clearInterval(this.interval);
      });
    }, noMetrics => {});
  },

	storeNewMetric(name) {
		if (this.metric) {
			this.metric.finish();
			this.db.insertNewMetric(this.metric);
      this.dashView.counter.textContent++;
		}

		this.metric = new Metric(null,name);
	},

	stopMetric() {
		if(this.metric != null){
			this.metric.finish();
			this.db.insertNewMetric(metric);
      this.dashView.counter.textContent++;
			this.metric = null;
		}
	},

	storeNewCodeMetric(fileName, code) {
		var codeMetric = this.codeMetrics[fileName];
		if(codeMetric) {
			var metrics = codeMetric.finish(code);
			for (var i in metrics) {
        this.db.insertNewMetric(metrics[i]);
        this.dashView.counter.textContent++;
      }
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
      if(this.interval){
        clearInterval(this.interval);
        this.checkUnsendData(atom.config.get('atom-logger.refreshTime')*1000);
      }
    })
  },


  logout() {
    if(this.server.token) {
      this.server.token = null;
      this.db.deleteToken();
      clearInterval(this.interval);
      this.dashView.statsContainer.innerHTML = '';
      this.icon.classList.remove('text-success');
      this.icon.classList.add('text-error');
      this.dashView.createWarning();
      this.dashView.element.removeChild(document.getElementById("logout"));
      atom.notifications.addSuccess("Successfully Logout");
    }
  }

}
