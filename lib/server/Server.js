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

					//CollectorLogger.getLogger().warning(this.response);
					console.log(this.response);
				}
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
		json[0] = json[json.length-1] = '\''

		var obj = {
			activity: '{"activities":[{"start_time":"2020-03-03T12:07:46.617008200Z","executable_name":"Project Explorer","mac_address":"44-1C-A8-5E-0F-D1","activity_type":"eclipse_tab_name","end_time":"2020-03-06T12:07:53.889113300Z","ip_address":"192.168.43.231","value":""}]}'
		}
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {
				//ciao
				//controllo 401
				console.log(JSON.parse(xhr.response))
				resolve();
			}
			xhr.open('POST', this.addr +'/activity');
			xhr.setRequestHeader('Authorization', 'token ' + this.token);
			xhr.send(obj);
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
