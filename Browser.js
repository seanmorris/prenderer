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

var NOT_HEADLESS = parseInt(process.env.NOT_HEADLESS);
var DONT_UNLOAD = parseInt(process.env.DONT_UNLOAD);

var Browser = exports.Browser = function () {
	function Browser(init) {
		var _this = this;

		_classCallCheck(this, Browser);

		var defaults = ['--no-sandbox', NOT_HEADLESS ? null : '--disable-gpu', NOT_HEADLESS ? null : '--headless', '--enable-automation', '--blink-settings=imagesEnabled=false'].filter(function (x) {
			return x;
		});

		var path = os.tmpdir() + '/.chrome-user';

		fs.mkdir(path, function () {
			// console.error('Userdir exists...' + "\n");
			_this.chrome = (0, _chromeLauncher.launch)({
				chromeFlags: defaults,
				'userDataDir': path,
				envVars: { 'HOME': path, DISPLAY: ':0' }
			}).then(function (chrome) {
				// console.error('Started chrome, connecting...' + "\n");
				_this.chrome = chrome;

				_this.port = chrome.port;

				// console.error('Debug port: ' + this.port);

				init();
			}).catch(function (error) {
				console.error(error);
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
						var clearCookies = function clearCookies() {
							0;
						};

						var setPrerenderFlag = function setPrerenderFlag() {
							window.prerenderer = 'prenderer';
						};

						client.Runtime.evaluate({
							expression: '(' + setPrerenderFlag + ')()'
						});

						var listenForRenderEvent = function listenForRenderEvent(timeout) {
							return new Promise(function (f, r) {
								document.addEventListener('renderComplete', function (event) {
									var docType = document.doctype ? new XMLSerializer().serializeToString(document.doctype) + "\n" : '';

									var result = docType + document.documentElement.outerHTML;

									f(result);
								});

								document.addEventListener('renderFail', function (event) {
									var docType = document.doctype ? new XMLSerializer().serializeToString(document.doctype) + "\n" : '';

									var result = docType + document.documentElement.outerHTML;

									r(result);
								});

								if (timeout) {
									setTimeout(function (args) {
										var docType = document.doctype ? new XMLSerializer().serializeToString(document.doctype) + "\n" : '';

										var result = docType + document.documentElement.outerHTML;

										f(result);
									}, parseInt(timeout));
								}
							});
						};

						// console.error(`(${listenForRenderEvent})(${settings.timeout})`);

						client.Runtime.evaluate({
							expression: '(' + listenForRenderEvent + ')(' + settings.timeout + ')',
							awaitPromise: true
						}).then(function (result) {
							DONT_UNLOAD || client.Page.navigate({ url: 'about:blank' });
							client.close();
							accept(result.result.value);
						}).catch(function (err) {
							console.error('Client Closed due to error...');
							console.error(err);
							client.close();
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
	}]);

	return Browser;
}();