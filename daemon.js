#!/usr/bin/node
'use strict';

var _Browser = require('./Browser');

var express = require('express');
var daemon = express();
var browser = new _Browser.Browser(function () {

	daemon.listen(3000, function () {
		console.log('Prenderer listening on port 3000!');
	});

	daemon.get('/', function (req, res) {
		if (!req.query.url) {
			res.send();
			return;
		}

		var settings = { timeout: req.query.timeout || 5000 };

		browser.prerender(req.query.url, settings).then(function (value) {
			console.error('Sending...');
			res.set('Content-Type', 'text/plain');
			res.send(value);
		});
	});

	// const url      = args[0];
	// const settings = {timeout: 5000};

	// args.slice(1).map((arg)=>{
	// 	let groups = /^--(\w+)=?(.+)?/.exec(arg);

	// 	if(groups)
	// 	{
	// 		settings[groups[1]] = groups[2] || true;
	// 	}
	// });

	// browser.prerender(url, settings).then((value)=>{
	// 	console.log(value);
	// });
});