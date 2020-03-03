'use babel';
import Stopwatch from './stopwatch';
import AtomLogger from './atom-logger';
import LoginView from './login-view';

export default class DashView {

  constructor() {
    this.session = false;

    this.element = document.createElement('div');
    this.element.classList.add('atom-logger');

    let title = document.createElement('h2');
    title.className = 'atom-logger-title';
    title.textContent = 'Atom-Logger DashBoard';
    this.element.appendChild(title);

    let cross = document.createElement('span');
    cross.className = 'icon icon-x atom-logger-close';
    this.element.appendChild(cross);

    let tabBar = document.createElement('div');
    this.element.appendChild(tabBar);

    let session = document.createElement('button');
    session.className = 'tabButton';
    session.classList.add('active');
    session.textContent = 'Session Stats';
    tabBar.appendChild(session);

    let weekly = document.createElement('button');
    weekly.className = 'tabButton';
    weekly.textContent = 'Weekly Stats';
    tabBar.appendChild(weekly);

    //session tab
    let sessionContainer = document.createElement('div');
    this.element.appendChild(sessionContainer);

    let logged = document.createElement('div');
    logged.className = 'logged';
    logged.textContent = 'Server Connection : ';
    sessionContainer.appendChild(logged);

    this.status = document.createElement('span');
    this.status.className = 'icon icon-primitive-dot';
    sessionContainer.appendChild(this.status);

    let footer = document.createElement('div');
    footer.className = 'atom-logger-footer'
    sessionContainer.appendChild(footer);

    let clock = document.createElement('h2');
    this.timer = new Stopwatch(clock);
    footer.appendChild(clock);

    this.loginButton = document.createElement('button');
    this.loginButton.className = 'atom-logger-button';
    this.loginButton.textContent = 'Login';
    footer.appendChild(this.loginButton);


    //end session tab

    //weekly tab

    let weeklyContainer = document.createElement('div');

    let prova = document.createElement('h3');
    prova.textContent = 'WEEKLY';
    weeklyContainer.appendChild(prova);

    //end weekly Tab

    session.addEventListener('click', () => {
      if(!session.classList.contains('active')){
        session.classList.add('active');
        weekly.classList.remove('active');
        weeklyContainer.remove();
        this.element.appendChild(sessionContainer);
      }
    })

    weekly.addEventListener('click', () => {
      if(!weekly.classList.contains('active')){
        weekly.classList.add('active');
        session.classList.remove('active');
        sessionContainer.remove();
        this.element.appendChild(weeklyContainer);
      }
    })

    cross.addEventListener('click', () => {
      AtomLogger.panel.hide();
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

  async startSession() {
    this.timer.start();

    var auth = await AtomLogger.server.isAuthenticated();
    if(auth){
      this.status.style.color = 'green';
      this.loginButton.textContent = 'Logout';
    }else{
      this.status.style.color = 'red';
    }
    this.setListener(auth);
  }

  setListener(auth) {
    if(auth){
      this.loginButton.addEventListener('click', () => {
        AtomLogger.db.deleteToken();
        this.status.style.color = 'red';
        this.loginButton.textContent = 'Login';
        this.loginButton.disabled = false;
        this.setListener(false);
      })
    }else{
      this.loginButton.addEventListener('click', () => {
        this.loginButton.disabled = 'true';
        var loginView = new LoginView();
        this.loginPanel = atom.workspace.addRightPanel({
          item: loginView.getElement(),
          visible: false
         });
        this.loginPanel.show();
      })
    }
  }
}
