'use babel';

import AtomLoggerView from './atom-logger-view';
import { CompositeDisposable } from 'atom';

export default {

  atomLoggerView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomLoggerView = new AtomLoggerView(state.atomLoggerViewState);
    this.modalPanel = atom.workspace.addModalPanel({
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
    console.log('AtomLogger was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
