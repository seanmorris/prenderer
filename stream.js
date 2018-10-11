#!/usr/bin/node
'use strict';

var _Browser = require('./Browser');

var readline = require('readline');
var handles = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
handles.pause();

var args = process.argv.slice(2);

var browser = new _Browser.Browser(function () {

	var settings = { timeout: 5000 };

	args.slice(1).map(function (arg) {
		var groups = /^--(\w+)=?(.+)?/.exec(arg);

		if (groups) {
			settings[groups[1]] = groups[2] || true;
		}
	});

	var url = args[0];
	var promises = [];

	handles.on('line', function (url) {
		promises.push(browser.prerender(url, settings).then(function (value) {
			console.log(JSON.stringify(value));
		}));
	});

	handles.on('close', function () {
		Promise.all(promises).then(function () {
			browser.kill();
		});
	});

	handles.resume();
});