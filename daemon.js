#!/usr/bin/node
'use strict';

var _Browser = require('./Browser');

var args = process.argv.slice(2);
var port = args[0] || 3000;
var express = require('express');
var daemon = express();
var browser = new _Browser.Browser(function () {

	daemon.listen(port, function () {
		console.log('Prenderer listening on port ' + port + '!');
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