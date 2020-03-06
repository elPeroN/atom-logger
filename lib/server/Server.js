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
				if (xhr.status == 200) {
					this.token = JSON.parse(xhr.response).token;
					if(logged) atomLogger.db.saveToken(this.token, this.addr);
					resolve(this.token);
				}else{

					CollectorLogger.warn(JSON.parse(xhr.response).message);
					console.log(this.response);
				}
			}
			xhr.onerror = (err) => {
				if (navigator.onLine === false) 
					CollectorLogger.warn('No internet available');
				else 
					CollectorLogger.error('Impossible to connect');
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
				//controllo 401
				console.log(JSON.parse(xhr.response))
				resolve();
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
				console.log(xhr)
				resolve(JSON.parse(xhr.response).activities);
			}
			xhr.open('GET', this.addr +'/activity');
			xhr.setRequestHeader('X-API-Key', this.token);
			xhr.send();
		})
	}
}
