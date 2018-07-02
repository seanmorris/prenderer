'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Browser = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chromeLauncher = require('chrome-launcher');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CDP = require('chrome-remote-interface');
var os = require('os');
var fs = require('fs');

var Browser = exports.Browser = function () {
	function Browser(ready) {
		var _this = this;

		_classCallCheck(this, Browser);

		console.error('Starting chrome...');

		var defaults = ['--no-sandbox', '--disable-gpu', '--headless', '--enable-automation'];

		var path = os.tmpdir() + '/.chrome-user';

		fs.mkdir(path, function () {
			_this.chrome = (0, _chromeLauncher.launch)({
				chromeFlags: defaults,
				'userDataDir': path,
				envVars: {
					'HOME': path
				}
			}).then(function (chrome) {
				_this.chrome = chrome;

				_this.port = chrome.port;

				console.error('Debug port: ' + _this.port);

				ready();
			});
		});
	}

	_createClass(Browser, [{
		key: 'connect',
		value: function connect(ready) {
			return CDP({ port: this.port }).then(function (client) {
				var Network = client.Network,
				    Page = client.Page;


				Network.requestWillBeSent(function (params) {
					console.error('Loading: ' + params.request.url);
				});

				Page.loadEventFired(function (params) {
					console.error('Loading complete.');
				});

				return Promise.all([Network.enable(), Page.enable()]).then(function () {
					ready(client);
				}).catch(function (err) {
					console.error('Client Closed due to error...');
					console.error(err);
					client.close();
				});
			});
		}
	}, {
		key: 'prerender',
		value: function prerender(url, settings) {
			var _this2 = this;

			return new Promise(function (accept, reject) {
				_this2.connect(function (client) {
					console.error('Goto ' + url);

					client.Page.navigate({ url: url }).then(function (c) {
						var setPrerenderCookie = function setPrerenderCookie() {
							document.cookie = 'prerenderer=prenderer';
						};

						client.Runtime.evaluate({
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

						// console.error(`(${listenForRenderEvent})(${settings.timeout})`);

						client.Runtime.evaluate({
							expression: '(' + listenForRenderEvent + ')(' + settings.timeout + ')',
							awaitPromise: true
						}).then(function (result) {
							client.close();
							accept(result.result.value);
						});
					});
				});
			});
		}
	}, {
		key: 'kill',
		value: function kill() {
			console.error('Killing chrome...');

			this.chrome.kill();
		}
	}, {
		key: 'goto',
		value: function goto(url) {
			var _this3 = this;

			return new Promise(function (accept, reject) {
				_this3.connect(function (client) {
					console.error('Goto ' + url);
					client.Page.navigate({ url: url }).then(function () {
						accept(client);
					});
				});
			});
		}
	}]);

	return Browser;
}();