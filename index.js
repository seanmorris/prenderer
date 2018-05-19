'use strict';

var _Browser = require('./Browser');

var browser = new _Browser.Browser(function (b) {
	browser.goto('https://isotope.seanmorr.is/').then(function (x) {
		var browserCode = function browserCode() {
			return new Promise(function (f, r) {
				document.addEventListener('renderComplete', function (event) {
					return f('Render Complete!');
				});

				setTimeout(function () {
					var event = new Event('renderComplete');
					document.dispatchEvent(event);
				}, 2500);
			});
		};

		b.Runtime.evaluate({
			expression: '(' + browserCode + ')()',
			awaitPromise: true
		}).then(function (x) {
			b.Runtime.evaluate({
				expression: 'document.documentElement.outerHTML'
			}).then(function (x) {
				console.log(x.result.value);

				browser.kill();
			});
		});
	});
});