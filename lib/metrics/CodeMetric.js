'use babel';

var Diff = require('diff');

import Metric from './Metric';

export default class CodeMetric extends Metric {

	constructor(name, session, source) {
		super(name, session);
		this.source = source;
	}

	finish(newSource) {
		this.endDate = Date.now();
		var differences = Diff.diffLines(this.source, newSource);

		var amountAdded = 0;
		var commentAdded = 0;
		var testAdded = 0;
		var amountDeleted = 0;
		var commentDeleted = 0;
		var testDeleted = 0;

		var metrics = [];
		for(var i in differences){
			if(differences[i].added){
				amountAdded += differences[i].count;
				commentAdded += this.findComments(differences[i].value);
				testAdded += this.findNewTests(differences[i].value);
			}else if(differences[i].removed){
				amountDeleted += differences[i].count;
				commentDeleted += this.findComments(differences[i].value);
				testDeleted += this.findNewTests(differences[i].value);
			}
		}

		console.log(amountAdded)
		console.log(commentAdded)

		if(amountAdded){
			metrics.push(new Metric(0, this.tabName, this.startDate, this.endDate,
					"eclipse_lines_added",
					amountAdded,
					this.session));
		}
		if(commentAdded){
			metrics.push(new Metric(0, tabName, startDate, endDate,
					"eclipse_comments_added",
					commentAdded,
					session));
		}
		if(testAdded){
			metrics.push(new Metric(0, tabName, startDate, endDate,
					"eclipse_tests_added",
					testAdded,
					session));
		}
		if(amountDeleted){
			metrics.push(new Metric(0, tabName, startDate, endDate,
					"eclipse_lines_deleted",
					amountDeleted,
					session));
		}
		if(commentDeleted){
			metrics.push(new Metric(0, tabName, startDate, endDate,
					"eclipse_comments_deleted",
					commentDeleted,
					session));
		}
		if(testDeleted){
			metrics.push(new Metric(0, tabName, startDate, endDate,
					"eclipse_tests_deleted",
					testDeleted,
					session));
		}

		console.log(metrics);
		return metrics;
	}

	findComments(delta) {
		// Add xml comments, add check of file type
		var commentStrings = ["//", "%", "#", "*"];
		//icao
		var lines = delta.split('\n');
		var amount = 0;
		for(var line in lines) {
			if (commentStrings.some(o => line.includes(o))) {
				amount += 1;
			}
		}

		return amount;
	}

	findNewTests(delta) {
		var testDeclarationStrings = ["@Test", "@Given", "@When", "@Then"];

		var lines = delta.split('\n');
		var amount = 0;
		for (var line in lines) {
			if (testDeclarationStrings.some(o => line.includes(o))) {
				amount += 1;
			}
		}

		return amount;
	}
}
