'use babel';

import Metric from './Metric';

export default class CodeMetric extends Metric {

	constructor(name, source) {
		super(name);
		this.source = source;
	}

	finish(newSource) {
		this.endDate = Date.now();
		var sourceList = this.source.split("\n");
		var newSourceList = newSource.split("\n");
		console.log(sourceList);
		console.log(newSourceList);
		
	/*	var differences = findDiff(sourceList, newSourceList);
		var metrics = [];
		for (var delta in differences) {
			var deltaName = delta.getClass().getName().replace("difflib.", "").replace("Delta", "").toLowerCase();
			var oldLinesSize = delta.getOriginal().getLines().size();
			var newLinesSize = delta.getRevised().getLines().size();
			var amount = Math.max(oldLinesSize, newLinesSize);

			if (amount > 0) {
				metrics.add(new Metric(0, tabName, startDate, endDate,
						"eclipse_lines_" + deltaName,
						amount.toString(),
						session));
			}
			metrics.push(findComments(delta));
			metrics.push(findNewTests(delta));
		}*
		return metrics;*/
		return [];
	}

	findComments(delta) {
		// Add xml comments, add check of file type
		var commentStrings = ["//", "%", "#", "*"];

		var lines = delta.getRevised().getLines();
		var amountAdded = 0;
		for(var line in lines) {
			if (commentStrings.some(o => line.includes(o))) {
				amountAdded += 1;
			}
		}

		lines = delta.getOriginal().getLines();
		var amountDeleted = 0;
    for(var line in lines) {
			if (commentStrings.some(o => line.includes(o))) {
				amountDeleted += 1;
			}
		}
		var metrics = [];
		if (amountAdded > 0) {
			metrics.add(new Metric(0, tabName, startDate, endDate,
					"eclipse_comments_added",
					amountAdded.toString(),
					session));
		}
		if (amountDeleted > 0) {
			metrics.add(new Metric(0, tabName, startDate, endDate,
					"eclipse_comments_deleted",
					amountDeleted.toString(),
					session));
		}
		return metrics;
	}

	findNewTests(delta) {
		var testDeclarationStrings = ["@Test", "@Given", "@When", "@Then"];

		var lines = delta.getRevised().getLines();
		var amountAdded = 0;
		for (var line in lines) {
			if (testDeclarationStrings.some(o => line.includes(o))) {
				amountAdded += 1;
			}
		}

		lines = delta.getOriginal().getLines();
		var amountDeleted = 0;
		for (line in lines) {
      if (testDeclarationStrings.some(o => line.includes(o))) {
				amountDeleted += 1;
			}
		}

    metrics = [];
		if (amountAdded > 0) {
			metrics.add(new Metric(0, tabName, startDate, endDate,
					"eclipse_tests_added",
					amountAdded.toString(),
					session));
		}
		if (amountDeleted > 0) {
			metrics.add(new Metric(0, tabName, startDate, endDate,
					"eclipse_tests_deleted",
					amountDeleted.toString(),
					session));
		}
		return metrics;
	}
}
