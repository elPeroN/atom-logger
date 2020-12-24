'use babel';

import atomLogger from '../atom-logger'
import CollectorLogger from '../loggs/CollectorLogger'

export default class Server {

	//Funzione che date le credenziali dell'utente si collega al server
	authenticate(credentials, logged) {
		this.addr = credentials.prot+credentials.addr;
		var email = credentials.email;
		var password = credentials.pass;

		if (!this.addr || !email || !password) return null;

		return new Promise((resolve, reject) => {

			var xhr = new XMLHttpRequest();
			xhr.onload = () => {
				if (xhr.getResponseHeader('Content-Type') !== 'application/json'){
					atom.notifications.addError("ERROR - Wrong server");
				}
				// Login eseguito con successo
				else if (xhr.status === 200) {
					this.token = JSON.parse(xhr.response).token;
					if(logged) atomLogger.db.saveToken(this.token, this.addr);
					atom.notifications.addSuccess("Successfully Login");
					resolve(this.token);
				// Login fallito
				}else{
					 atom.notifications.addWarning(JSON.parse(xhr.response).message);
				}
			}
			// Richiesta fallita
			xhr.onerror = (err) => {
				// Connessione assente
				if (navigator.onLine === false) {
					atom.notifications.addError('No internet available')
				// Altri problemi rilevati
				} else {
					atom.notifications.addError('Impossible to connect');
				}
			}
			xhr.open('POST', this.addr + "/login", true);
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.send(JSON.stringify({email: email, password: password}));
		})
	}

	//Funzione che manda le metriche al server
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
				// Upload metriche andato a buon fine
				if (xhr.status == 200 || xhr.status == 201) {
					CollectorLogger.info('Metrics successfully sent to server!');
					resolve(true);
				// Upload metriche fallito
				}else{
					CollectorLogger.warn('Unable to send metrics. '+xhr.status);
					reject(false);
				}
			}
			xhr.onerror = (err) => {
				// Connessione assente
				if (navigator.onLine === false) {
					CollectorLogger.error('Unable to send metrics, no internet available');
				}
				// Altri problemi di connessione al server
				else {
					CollectorLogger.error('Unable to send metrics, impossible to connect');
				}
				reject(false);
			}
			xhr.open('POST', this.addr +'/activity');
			xhr.setRequestHeader('Authorization', 'token ' + this.token);
			xhr.send(formData);
		})
	}

	//Funzione che ottiene le statistiche dal server
	getStatistics() {
		let end = new Date().toISOString();
    let count = new Date();
    count.setDate(count.getDate() - 7);
		let start = count.toISOString();
		var params = "amount_to_return=10000&start_time="+start+"&end_time="+end;
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {

				// Download metriche andato a buon fine
				if(xhr.status == 200){
					CollectorLogger.info('Metrics successfully fetched from the server!');
					resolve(JSON.parse(xhr.response).activities);
				// Metriche non disponibili/inesistenti
				}else {
					CollectorLogger.warn('Unable to fetch metrics, '+(xhr.status));
					reject();
				}
			}
			xhr.onerror = (err) => {
				// Connessione assente
				if (navigator.onLine === false) {
					CollectorLogger.error('Unable to fetch metrics, no internet available.');
				// Alri problemi di connessione
				}else{
					CollectorLogger.error('Unable to fetch metrics, impossible to connect.');
				}
				reject();
			}
			xhr.open('GET', this.addr +'/activity?'+params);
			xhr.setRequestHeader('X-API-Key', this.token);
			xhr.send();
		})
	}
}
