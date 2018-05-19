'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Browser = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chromeLauncher = require('chrome-launcher');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import { CDP    } from 'chrome-remote-interface';

var CDP = require('chrome-remote-interface');

var Browser = exports.Browser = function () {
	function Browser(ready) {
		var _this = this;

		_classCallCheck(this, Browser);

		console.error('Starting chrome...');

		var defaults = ['--disable-gpu', '--no-sandbox', '--headless'];

		this.cdpClient = null;

		this.chrome = (0, _chromeLauncher.launch)({
			chromeFlags: defaults
		}).then(function (chrome) {
			_this.chrome = chrome;

			_this.port = chrome.port;

			console.error('Debug port: ' + _this.port);

			_this.connect(ready);
		});
	}

	_createClass(Browser, [{
		key: 'connect',
		value: function connect(ready) {
			var _this2 = this;

			if (this.cdpClient) {
				return this.connected(this.cdpClient, ready);
			}

			return CDP({ port: this.port }).then(function (client) {
				_this2.cdpClient = client;

				return _this2.connected(_this2.cdpClient, ready);
			});

			// CDP({port: this.port}, (client) => {
			// 	
			// 	this.connected(client, ready);	
			// }).on('error', (err) => {
			// 	console.error(err);
			// });
		}
	}, {
		key: 'connected',
		value: function connected(client, ready) {
			var Network = client.Network,
			    Page = client.Page;


			Network.requestWillBeSent(function (params) {
				console.error('Loading: ' + params.request.url);
			});

			Page.loadEventFired(function (params) {
				// console.error(params);
				// console.error('Client Closed...');
				// client.close();
			});

			return Promise.all([Network.enable(), Page.enable()]).then(function () {
				ready(client);
			}).catch(function (err) {
				console.error('Client Closed due to error...');
				console.error(err);
				client.close();
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