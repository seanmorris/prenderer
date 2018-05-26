#!/usr/bin/node
'use strict';

var _Browser = require('./Browser');

var args = process.argv.slice(2);

var browser = new _Browser.Browser(function (b) {

	var url = args[0];
	var settings = { timeout: 5000 };

	args.slice(1).map(function (arg) {
		var groups = /^--(\w+)=?(.+)?/.exec(arg);

		if (groups) {
			settings[groups[1]] = groups[2] || true;
		}
	});

	console.error(settings);

	browser.goto(url).then(function () {
		var setPrerenderCookie = function setPrerenderCookie() {
			document.cookie = 'prerenderer=prenderer';
		};

		b.Runtime.evaluate({
			expression: '(' + setPrerenderCookie + ')()'
		});

		var listenForRenderEvent = function listenForRenderEvent(timeout) {
			return new Promise(function (f, r) {
				var docType = document.doctype ? new XMLSerializer().serializeToString(document.doctype) + "\n" : '';

				document.addEventListener('renderComplete', function (event) {
					return f(docType + document.documentElement.outerHTML);
				});

				if (timeout) {
					setTimeout(function (args) {
						f(docType + document.documentElement.outerHTML);
					}, parseInt(timeout));
				}
			});
		};

		console.error('(' + listenForRenderEvent + ')(' + settings.timeout + ')');

		b.Runtime.evaluate({
			expression: '(' + listenForRenderEvent + ')(' + settings.timeout + ')',
			awaitPromise: true
		}).then(function (result) {
			console.log(result.result.value);

			browser.kill();
		});
	});
});