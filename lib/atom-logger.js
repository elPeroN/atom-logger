'use babel';

import LoginView from './login-view';
import DashView from './dash-view';
import { CompositeDisposable } from 'atom';

export default {

  atomLoggerLoginView: null,
  atomLoggerDashView:null,
  panel: null,
  dashPanel: null,
  subscriptions: null,

  activate(state) {
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
    this.atomLoggerLoginView.destroy();
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
  }

};
