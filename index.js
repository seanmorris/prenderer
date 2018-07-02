#!/usr/bin/node
'use strict';

var _Browser = require('./Browser');

var args = process.argv.slice(2);

var browser = new _Browser.Browser(function () {

	var url = args[0];
	var settings = { timeout: 5000 };

	args.slice(1).map(function (arg) {
		var groups = /^--(\w+)=?(.+)?/.exec(arg);

		if (groups) {
			settings[groups[1]] = groups[2] || true;
		}
	});

	browser.prerender(url, settings).then(function (value) {
		console.log(value);
		browser.kill();
	});
});