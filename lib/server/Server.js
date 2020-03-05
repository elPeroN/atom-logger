'use babel';

import atomLogger from '../atom-logger'

export default class Server {

	async isAuthenticated(){
		this.addr = await atomLogger.db.getAddr();
		this.token = await atomLogger.db.getToken(this.addr);
		
		if(atom.config.get('atom-logger.remember')) {
			this.token = await this.db.getToken(this.addr);
		}else{
			this.token = null;
		}

		if (!this.addr || !this.token) {
			return false;
		}else {
			return true;
		}
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
					if(logged) this.db.saveToken(this.token, this.addr);
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
		for (var metric in metrics) {
			var json_metric = {};
			json_metric.executable_name = metric.tabName;
			json_metric.start_time = metric.startDate;
			json_metric.end_time = metric.endDate;
			json_metric.ip_address = metric.session.ipAddr;
			json_metric.mac_address = metric.session.macAddr;
			json_metric.activity_type = metric.activity_type;
			json_metric.value = metric.value;
			activities.push(json_metric);
		}

		return false;
		var xhr = new XMLHttpRequest();
		http.open('POST', this.addr + "/activity", true);
		xhr.onload = () => {
			if (xhr.status != 201) {
				console.log(xhr.status);
				return false;
			}
			return true;
		}
		xhr.setRequestHeader("Authorization", "Token " + this.token);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.send(JSON.parse({activities: activities}));
	}
}
