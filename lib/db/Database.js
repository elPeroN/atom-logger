'use babel';
const sqlite3 = require('sqlite3').verbose();

import Metric from '../metrics/Metric';
import Session from '../metrics/Session';

export default class Database {

	constructor() {
		//this.dropTables();
		this.createTables();
	}

	// Funzione che crea una nuova connessione al database SQLite
	newConnection() {
		var db = new sqlite3.Database('.innometrics.db', (err) => {
			if(err){
				CollectorLogger.error(err);
				atom.notifications.addError(err)
			}
		});

		return db;
	}

	//Funzione che elimina tutte le tabelle in locale
	dropTables(){
		let db = this.newConnection();
		let sql = "DROP TABLE METRIC ";

		db.run(sql, [], (err) => {
			if(err){
				CollectorLogger.error(err);
				atom.notifications.addError(err, options)
			}
		});

		sql = "DROP TABLE TOKEN ";

		db.run(sql, [], (err) => {
			if(err){
				CollectorLogger.error(err);
				atom.notifications.addError(err, options)
			}
		});

		db.close();
	}

	//Funzione che crea le tabelle nel database locale, se non esistono ancora
	async createTables(){
		let db = this.newConnection();
		let sql =
			"CREATE TABLE IF NOT EXISTS METRIC " +
			"(ID INTEGER PRIMARY KEY," +
			" name           TEXT    NOT NULL, " +
			" start_date     varchar(50)     NOT NULL, " +
			" end_date       varchar(50)	NOT NULL, " +
			" ip_addr		 varchar(50), " +
			" activity_type		 varchar(50) NOT NULL, " +
			" value		 TEXT, " +
			"mac_addr 	 varchar(50));"

		db.run(sql, [], (err) => {
			if(err){
				CollectorLogger.error(err);
				atom.notifications.addError(err, options)
			}
		});

		sql =
			"CREATE TABLE IF NOT EXISTS TOKEN " +
			"(ID INTEGER PRIMARY KEY, " +
			"value varchar(100) NOT NULL, " +
			"addr varchar(100) NOT NULL);";

		db.run(sql, [], (err) => {
			if(err){
				atom.notifications.addError(err)
				CollectorLogger.error(err);
			}
		});

		db.close();
	}

	//Funzione che inserisce una metriche passata come parametro nel database
	insertNewMetric(metric) {

		let db = this.newConnection();
		let sql = "INSERT INTO METRIC "
				+ "(name, start_date, end_date, ip_addr, mac_addr,"
				+ "activity_type, value) VALUES ('" +
				metric.tabName + "', '" +
				metric.startDate + "', '" +
				metric.endDate + "', '" +
				metric.session.ipAddr  + "', '" +
				metric.session.macAddr  + "', '" +
				metric.activity_type  + "', '" +
				metric.value  + "');";

		db.run(sql, [], (err) => {
			if(err){
				CollectorLogger.error(err);
				atom.notifications.addError(err)
			}
		})

		db.close();
	}

	//Funzione che ritorna tutte le metriche del Database
	getMetrics() {
		var metrics = [];
		let db = this.newConnection();
		let sql = "SELECT * FROM METRIC;";

		return new Promise((resolve, reject) => {
			db.all(sql, [], (err, rows) => {
				if(err){
					CollectorLogger.error(err);
					atom.notifications.addError(err)
					reject();
				}else{
					rows.forEach((row) => {
						metrics.push(new Metric(row.ID, row.name, row.start_date,
								row.end_date, row.activity_type, row.value,
								new Session(row.ip_addr, row.mac_addr)));
					});
					resolve(metrics);
				}
			})

			db.close();
		})
	}

	//Funzione che elimina le metriche passate come parametro dal database
	deleteMetrics(metrics) {
		if (!metrics.length) {
			return;
		}

		var ids = [];
		for (var i in metrics) {
			ids.push(metrics[i].id);
		}

		let db = this.newConnection();
		let sql = "DELETE FROM METRIC WHERE id in (" +
				ids.toString() + ");";

		db.run(sql, [], (err) => {
			if(err){
				atom.notifications.addError(err)
				CollectorLogger.error(err);
			}
		})

		db.close();
	}

	//Funione che salva il token di accesso sul database
	//Il token servirà per riconnettersi in futuro senza inserire di
	//nuovo le credenziali
	saveToken(token, addr) {
		let db = this.newConnection();

		let sql = "INSERT INTO TOKEN (value, addr) VALUES(?, ?);";

		db.all(sql, [token, addr], (err) => {
			if (err) {
				CollectorLogger.error(err);
			}
		});

		db.close();
	}

	//Funzione che rimuove il token di accesso dal database
  deleteToken(){
		let db = this.newConnection();
		let sql = "DELETE FROM TOKEN;"

		db.all(sql, [], (err) => {
			if (err) {
				CollectorLogger.error(err);
			}
		});

		db.close();
	}

	//Funzione che ottiene il token di accesso dal database
	getToken(addr) {
		let db = this.newConnection();
		let sql = "SELECT VALUE FROM TOKEN "
				+ "WHERE addr=? ORDER"
				+ " BY ID DESC LIMIT 1;";

		return new Promise((resolve, reject) => {
			db.all(sql, [addr], (err, rows) => {
				if(err){
					atom.notifications.addError(err)
					CollectorLogger.error(err);
				}else if(rows.length){
					resolve(rows[0].value);
				}

				resolve();
			});
			db.close();
		})
	}

	//Funzione che ottiene l'ultimo indirizzo del server in cui
	//l'utente si è loggato
	async getAddr() {
		let db = this.newConnection();
		let sql = "SELECT ADDR FROM TOKEN "
				+ "ORDER "
				+ "BY ID DESC LIMIT 1;";

		return new Promise((resolve, reject) => {
			db.all(sql, [], (err, rows) => {
				if(err){
					atom.notifications.addError(err);
					CollectorLogger.error(err);
				}else if(rows.length){
					resolve(rows[0].addr);
				}

				resolve();
			});
			db.close();
		})
	}
}
