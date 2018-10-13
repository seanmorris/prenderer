#!/usr/bin/node
'use strict';

var _Browser = require('./Browser');

var args = process.argv.slice(1);
var settings = { timeout: 5000 };

args.slice(1).map(function (arg) {
	var groups = /^--(\w+)=?(.+)?/.exec(arg);

	if (groups) {
		settings[groups[1]] = groups[2] || true;
	}
});

var single = function single() {
	var url = args[1];
	var browser = new _Browser.Browser(function () {
		if (url) {
			browser.prerender(url, settings).then(function (value) {
				console.log(value);
				browser.kill();
			});
		} else {
			console.error('Please supply a URL.');
			browser.kill();
		}
	});
};

var streaming = function streaming() {
	var readline = require('readline');
	var handles = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false
	});
	handles.pause();

	var args = process.argv.slice(2);

	console.error('Prenderer is running in streaming mode!');

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
};

var daemon = function daemon() {
	var port = args[2] || 3003;
	var express = require('express');
	var daemon = express();
	var browser = new _Browser.Browser(function () {

		daemon.listen(port, function () {
			console.error('Prenderer is listening on port ' + port + '!');
		});

		daemon.get('/', function (req, res) {
			if (!req.query.url) {
				res.send();
				return;
			}

			var settings = { timeout: req.query.timeout || 5000 };

			browser.prerender(req.query.url, settings).then(function (value) {
				console.error('Sending...');
				res.send(value);
			});
		});
	});
};

switch (true) {
	case settings['streaming']:
		streaming();
		break;
	case settings['daemon']:
		daemon();
		break;
	default:
		single();
		break;
}