'use babel';
const sqlite3 = require('sqlite3').verbose();

import Metric from '../metrics/Metric';
import Session from '../metrics/Session';

export default class Database {

	constructor() {
		this.createTables();
	}

	newConnection() {
		var db = new sqlite3.Database('.innometrics.db', (err) => {
			if(err){
				CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		return db;
	}

	createTables(){
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
			"mac_addr 	 varchar(50));" +
			"CREATE TABLE TOKEN (ID INTEGER PRIMARY KEY, " +
			"value varchar(100) NOT NULL, " +
			"addr varchar(100) NOT NULL);";

		db.run(sql);
		db.close();
	}

	insertNewMetric(metric) {
		let db = this.newConnection();
		let sql = "INSERT INTO METRIC "
				+ "(name, start_date, end_date, ip_addr, mac_addr,"
				+ "activity_type, value) VALUES ('" +
				metric.tabName + "', '" +
				metric.startDate.toString() + "', '" +
				metric.endDate.toString() + "', '" +
				metric.session.ipAddr  + "', '" +
				metric.session.macAddr  + "', '" +
				metric.activity_type  + "', '" +
				metric.value  + "');";

		console.log(sql);

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

		db.all(sql, [], (err, rows) => {
			if(err){
				CollectorLogger.getLogger().severe(e.getMessage());
			}else{
				rows.forEach((row) => {
					metrics.push(new Metric(row.id, row.name, row.startDate,
							row.endDate, row.activity_type, row.value,
							new Session(row.ip_addr, row.mac_addr)));
				});
			}
		})

		db.close();
		return metrics;
	}

	deleteMetrics(metrics) {
		if (metrics.isEmpty()) {
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
				CollectorLogger.getLogger().severe(e.getMessage());
			}
		})

		db.close();
	}

	saveToken(token, addr) {
		let db = this.newConnection();
		let sql = "DELETE FROM TOKEN;"
				+ "INSERT INTO TOKEN (value, addr) VALUES(?, ?);";

		db.run(sql, [token, addr], (err) => {
			if (err) {
				CollectorLogger.getLogger().severe(e.getMessage());
			}
		});

		db.close();
	}

	getToken(addr) {
		var token;
		let db = this.newConnection();
		let sql = "SELECT VALUE FROM TOKEN "
				+ "WHERE addr='?' ORDER"
				+ " BY ID DESC LIMIT 1;";

		db.run(sql, addr, (err, rows) => {
			if(err){
				CollectorLogger.getLogger().severe(e.getMessage());
			}else if(rows.length){
				token = rows[0].value;
			}
		});

		db.close();
		return token;
	}

	getAddr() {
		let db = this.newConnection();
		let sql = "SELECT ADDR FROM TOKEN "
				+ "ORDER"
				+ " BY ID DESC LIMIT 1;";
		var addr;

		db.run(sql, [], function(err) {
			if(err){
				CollectorLogger.getLogger().severe(e.getMessage());
			}else if(rows.length){
				addr = rows[0].addr;
			}
		});

		db.close();
		return addr;
	}
}
