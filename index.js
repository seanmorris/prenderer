#!/usr/bin/node
'use strict';

var _Browser = require('./Browser');

var args = process.argv.slice(2);

var browser = new _Browser.Browser(function (b) {

	var url = args[0];

	browser.goto(url).then(function () {
		var setPrerenderCookie = function setPrerenderCookie() {
			document.cookie = 'prerenderer=prenderer';
		};

		b.Runtime.evaluate({
			expression: '(' + setPrerenderCookie + ')()'
		});

		var listenForRenderEvent = function listenForRenderEvent() {
			return new Promise(function (f, r) {
				var docType = document.doctype ? new XMLSerializer().serializeToString(document.doctype) + "\n" : '';

				document.addEventListener('renderComplete', function (event) {
					return f(docType + document.documentElement.outerHTML);
				});

				var timeout = setTimeout(function (args) {
					f(docType + document.documentElement.outerHTML);
				}, 5000);
			});
		};

		b.Runtime.evaluate({
			expression: '(' + listenForRenderEvent + ')()',
			awaitPromise: true
		}).then(function (result) {
			console.log(result.result.value);

			browser.kill();
		});
	});
});