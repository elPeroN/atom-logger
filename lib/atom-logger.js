'use babel';

import AtomLoggerLoginView from './atom-logger-login-view';
import { CompositeDisposable } from 'atom';

export default {

  atomLoggerView: null,
  panel: null,
  subscriptions: null,

  activate(state) {
    this.atomLoggerView = new AtomLoggerLoginView(state.atomLoggerViewState);

    this.panel = atom.workspace.addRightPanel({
      item: this.atomLoggerView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-logger:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomLoggerView.destroy();
  },

  serialize() {
    return {
      atomLoggerViewState: this.atomLoggerView.serialize()
    };
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
