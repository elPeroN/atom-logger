'use babel';

import Session from './Session';

currentSession = new Session();

export default class Metric {

  	constructor(fileName, activity_type, startDate, endDate, id, value, session) {
  		this.id = id;
  		this.tabName = fileName;
      if(startDate) this.startDate = startDate;
      else this.startDate = Date.now();
      this.endDate = endDate;
  		if(session) this.session = session;
      else this.session = currentSession;
  		this.activity_type = activity_type;
  		this.value = value;
  	}

  	finish() {
  		this.endDate = Date.now();
  	}

  	print() {
  		console.log(this.tabName);
  		console.log(this.startDate);
  		console.log(this.endDate);
  		console.log(this.session.ipAddr);
  		console.log(this.activity_type);
  		console.log(this.value);
  	}
  }
