'use babel';
const sqlite3 = require('sqlite3').verbose();

import Metric from '../metrics/Metric';
import Session from '../metrics/Session';

export default class Database {

	constructor() {
		this.createTables();
		//this.dropTables();
	}

	newConnection() {
		var db = new sqlite3.Database('.innometrics.db', (err) => {
			if(err){
				CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		return db;
	}

	dropTables(){
		let db = this.newConnection();
		let sql = "DROP TABLE METRIC ";

		db.run(sql, [], (err) => {
			if(err){
				console.log(err)
				//CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		sql = "DROP TABLE TOKEN ";

		db.run(sql, [], (err) => {
			if(err){
				console.log(err)
				//CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		db.close();
	}

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
				console.log(err)
				//CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		sql =
			"CREATE TABLE IF NOT EXISTS TOKEN " +
			"(ID INTEGER PRIMARY KEY, " +
			"value varchar(100) NOT NULL, " +
			"addr varchar(100) NOT NULL);";

		db.run(sql, [], (err) => {
			if(err){
				console.log(err)
				//CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		db.close();
	}

	insertNewMetric(metric) {
		console.log(metric);
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
				CollectorLogger.getLogger().severe(e.getMessage());
			}
		})

		db.close();
	}

	getMetrics() {
		var metrics = [];
		let db = this.newConnection();
		let sql = "SELECT * FROM METRIC;";

		return new Promise((resolve, reject) => {
			db.all(sql, [], (err, rows) => {
				if(err){
					console.log(err)
					//CollectorLogger.getLogger().severe(e.getMessage());
					reject();
				}else{
					rows.forEach((row) => {
						metrics.push(new Metric(row.ID, row.name, row.startDate,
								row.endDate, row.activity_type, row.value,
								new Session(row.ip_addr, row.mac_addr)));
					});
					resolve(metrics);
				}
			})

			db.close();
		})
	}

	deleteMetrics(metrics) {
		if (!metrics.length) {
			return;
		}

		var ids = [];
		for (metric in metrics) {
			ids.push(metric.id);
		}

		let db = this.newConnection();
		let sql = "DELETE FROM METRIC WHERE id in (" +
				ids.toString() + ");";

		db.run(sql, [], (err) => {
			if(err){
				console.log(err);
				//CollectorLogger.getLogger().severe(e.getMessage());
			}
		})

		db.close();
	}

  deleteToken(){
		let db = this.newConnection();
		let sql = "DELETE FROM TOKEN;"

		db.all(sql, [], (err) => {
			if (err) {
				console.log(err)
				//CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		db.close();
	}

	saveToken(token, addr) {
		let db = this.newConnection();

		sql = "INSERT INTO TOKEN (value, addr) VALUES(?, ?);";

		db.all(sql, [token, addr], (err) => {
			if (err) {
				console.log(err)
				//CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		db.close();
	}

	getToken(addr) {
		let db = this.newConnection();
		let sql = "SELECT VALUE FROM TOKEN "
				+ "WHERE addr=? ORDER"
				+ " BY ID DESC LIMIT 1;";

		return new Promise((resolve, reject) => {
			db.all(sql, [addr], (err, rows) => {
				if(err){
					console.log(err);
					//CollectorLogger.getLogger().severe(e.getMessage());
				}else if(rows.length){
					resolve(rows[0].value);
				}

				resolve();
			});
			db.close();
		})
	}

	async getAddr() {
		let db = this.newConnection();
		let sql = "SELECT ADDR FROM TOKEN "
				+ "ORDER "
				+ "BY ID DESC LIMIT 1;";

		return new Promise((resolve, reject) => {
			db.all(sql, [], (err, rows) => {
				if(err){
					console.log(err);
					//CollectorLogger.getLogger().severe(e.getMessage());
				}else if(rows.length){
					resolve(rows[0].addr);
				}

				resolve();
			});
			db.close();
		})
	}
}
