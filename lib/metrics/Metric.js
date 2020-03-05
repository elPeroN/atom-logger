'use babel';

import currentSession from '../atom-logger'

export default class Metric {

	constructor(id, fileName, startDate, endDate, activity_type, value, session) {
		this.id = id;
		this.tabName = fileName;
		if(!startDate) startDate = new Date();
		this.startDate = startDate;
		this.endDate = endDate;
		if(!session) session = currentSession;
		this.session = session;
		if(!activity_type) activity_type = "eclipse_tab_name";
		this.activity_type = activity_type;
		if(!value) value = "";
		this.value = value;
	}

	finish() {
		this.endDate = new Date();
	}
}
