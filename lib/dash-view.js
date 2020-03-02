'use babel';
import Stopwatch from './stopwatch';

export default class DashView {

  constructor(serializedState, db) {
    this.session = false;

    this.element = document.createElement('div');
    this.element.classList.add('atom-logger');

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

    let carlotest = document.createElement('button');
    carlotest.className = 'atom-logger-button';
    carlotest.textContent = 'CarloTest';
    sessionContainer.appendChild(carlotest);

    let footer = document.createElement('div');
    footer.className = 'atom-logger-footer'
    sessionContainer.appendChild(footer);

    let clock = document.createElement('h2');
    let timer = new Stopwatch(clock);
    footer.appendChild(clock);

    this.start = document.createElement('button');
    this.start.className = 'atom-logger-button';
    this.start.textContent = 'Start Session';
    footer.appendChild(this.start);

    let endSession = document.createElement('button');
    endSession.className = 'atom-logger-button';
    endSession.textContent = 'End Session';
    footer.appendChild(endSession);

    let logout = document.createElement('button');
    logout.className = 'atom-logger-button';
    logout.textContent = 'Logout';
    footer.appendChild(logout);
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

    this.start.addEventListener('click', () => {
      if(!this.session){
        this.session = true;
        timer.start();
        this.start.textContent = 'Pause';
      }else{
        this.session = false;
        timer.stop();
        this.start.textContent = 'Resume';
      }
    })

    endSession.addEventListener('click', () => {
      timer.clear();
      this.session = false;
      this.start.textContent = 'Start Session';
    })

    logout.addEventListener('click', () => {
      //aggiungere funzione di logout
      db.deleteToken();
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
}
