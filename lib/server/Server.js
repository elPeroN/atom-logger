'use babel';

import atomLogger from '../atom-logger'

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
					if (xhr.status == 404) {
						atom.notifications.addError('Error:404  Invalid mail or password');
					}else if(xhr.status == 405){
  					atom.notifications.addError('Error:405  Invalid server');
					}else{
						atom.notifications.addError('Error:' + xhr.status);
					}
					//CollectorLogger.getLogger().warning(this.response);
					atomLogger.dashView.loginPanel.destroy();
					atomLogger.dashView.loginButton.disabled = false;
				}
			}
			xhr.onerror = () => {
				atom.notifications.addError('Network Error');
				//CollectorLogger.getLogger().warning(this.response);
				atomLogger.dashView.loginPanel.destroy();
				atomLogger.dashView.loginButton.disabled = false;
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
			var json_metric = {};
			json_metric.executable_name = metrics[i].tabName;
			json_metric.start_time = metrics[i].startDate;
			json_metric.end_time = metrics[i].endDate;
			json_metric.ip_address = metrics[i].session.ipAddr;
			json_metric.mac_address = metrics[i].session.macAddr;
			json_metric.activity_type = metrics[i].activity_type;
			json_metric.value = metrics[i].value;
			activities.push(json_metric);
		}

		return false;
		var xhr = new XMLHttpRequest();
		xhr.open('POST', this.addr + "/activity", true);
		xhr.onload = () => {
			console.log(xhr)
			if (xhr.status != 201) {
				console.log(xhr.status);
				return false;
			}
			return true;
		}
		console.log(JSON.stringify({activities: activities}))
		xhr.setRequestHeader("Authorization", "Token " + this.token);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.send(JSON.stringify({activities: activities}));
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
