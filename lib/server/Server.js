'use babel';

import atomLogger from '../atom-logger'
import CollectorLogger from '../loggs/CollectorLogger'

export default class Server {

	async isAuthenticated(){
		this.addr = await atomLogger.db.getAddr();

		if(atom.config.get('atom-logger.remember')) {
			this.token = await atomLogger.db.getToken(this.addr);
		}else{
			this.token = null;
		}

		if (!this.addr || !this.token) return false;
		return true;
	}

	authenticate(credentials, logged) {
		this.addr = credentials.addr;
		var email = credentials.email;
		var password = credentials.pass;

		if (!this.addr || !email || !password) return null;

		return new Promise((resolve, reject) => {

			var xhr = new XMLHttpRequest();
			xhr.onload = () => {
				if (xhr.status === 200) {
					this.token = JSON.parse(xhr.response).token;
					if(logged) atomLogger.db.saveToken(this.token, this.addr);
					resolve(this.token);
				}else{
					atom.notifications.addWarning(JSON.parse(xhr.response).message);
				}
			}
			xhr.onerror = (err) => {
				console.log(err);
				if (navigator.onLine === false) {
					atom.notifications.addError('No internet available')
				} else
					atom.notifications.addError('Impossible to connect');
			}
			xhr.open('POST', this.addr + "/login", true);
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.send(JSON.stringify({email: email, password: password}));
		})
	}

	sendMetrics(metrics) {
		if (!this.token) return false;
		
		var activities = [];
		for (var i in metrics) {
			var metric = {};
			metric.executable_name = metrics[i].tabName;
			metric.start_time = metrics[i].startDate;
			metric.end_time = metrics[i].endDate;
			metric.ip_address = metrics[i].session.ipAddr;
			metric.mac_address = metrics[i].session.macAddr;
			metric.activity_type = metrics[i].activity_type;
			metric.value = metrics[i].value;
			activities.push(metric);
		}

		var json = JSON.stringify({activities: activities});

		var formData = new FormData(); // Currently empty
		formData.append("activity", json)

		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {
				if (xhr.status == 200 || xhr.status == 201) {
					console.log(JSON.parse(xhr.response));
					CollectorLogger.info('Metrics successfully sent to server!');
					resolve(true);
				}else{
					CollectorLogger.warn('Unable to send metrics. '+xhr.status);
					resolve(false);
				}
			}
			xhr.onerror = (err) => {
				if (navigator.onLine === false)
					CollectorLogger.error('Unable to send metrics, no internet available');
				else
					CollectorLogger.error('Unable to send metrics, impossible to connect');
				resolve(false);
			}
			xhr.open('POST', this.addr +'/activity');
			xhr.setRequestHeader('Authorization', 'token ' + this.token);
			xhr.send(formData);
		})
	}

	getStatistics() {

		if(!this.addr) return null;

		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {
				//controllo 401
				if(xhr.status == 200){
					resolve(JSON.parse(xhr.response).activities);
				}else if(xhr.status == 404){
					CollectorLogger.warn('Unable to fetch metrics, '+JSON.parse(xhr.response));
					resolve(null);
				}
			}
			xhr.onerror = (err) => {
				if (navigator.onLine === false)
					CollectorLogger.error('Unable to fetch metrics, no internet available.');
				else
					CollectorLogger.error('Unable to fetch metrics, impossible to connect.');
			}
			xhr.open('GET', this.addr +'/activity');
			xhr.setRequestHeader('X-API-Key', this.token);
			xhr.send();
		})
	}
}
