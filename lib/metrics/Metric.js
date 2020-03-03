'use babel';

export default class Metric {

	constructor(id, fileName, startDate, endDate, activity_type, value, session) {
		this.id = id;
		this.tabName = fileName;
		this.startDate = startDate;;
		this.endDate = endDate;
		this.session = session;
		this.activity_type = activity_type;
		this.value = value;
	}

	finish() {
		this.endDate = new Date();
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
