import { launch } from 'chrome-launcher';

const CDP = require('chrome-remote-interface');
const os  = require('os');
const fs  = require('fs');

export class Browser
{
	constructor(init)
	{
		console.error('Starting chrome...');

		const defaults = [
			'--no-sandbox'
			, '--disable-gpu'
			, '--headless'
			, '--enable-automation'
		];

		const path = os.tmpdir() + '/.chrome-user';

		fs.mkdir(path, () => {
			this.chrome = launch({
				chromeFlags: defaults
				, 'userDataDir': path
				, envVars: {
					'HOME' : path
				}
			}).then(chrome => {
				this.chrome = chrome;

				this.port = chrome.port;

				console.error('Debug port: ' + this.port);

				init();
			});
		});
	}

	connect(ready)
	{
		return CDP({port: this.port}).then(client=>{
			const {Network, Page} = client;

			Network.requestWillBeSent((params) => {
				console.error('Loading: ' + params.request.url);
			});

			Page.loadEventFired((params) => {
				console.error('Loading complete.');
			});

			return Promise.all([
				Network.enable(),
				Page.enable()
			]).then(() => {
				ready(client);
			}).catch((err) => {
				console.error('Client Closed due to error...');
				console.error(err);
				client.close();
			});
		});
	}

	prerender(url, settings)
	{
		return new Promise((accept, reject) => {
			this.connect((client)=>{
				console.error('Goto ' + url);

				client.Page.navigate({url}).then((c)=>{
					const setPrerenderCookie = () => {
						document.cookie = `prerenderer=prenderer`;
					};

					client.Runtime.evaluate({
						expression: `(${setPrerenderCookie})()`,
					});

					const listenForRenderEvent = (timeout) => {
						return new Promise((f,r)=>{
							let docType = document.doctype
								? new XMLSerializer().serializeToString(document.doctype)
									+ "\n"
								: '';
							
							document.addEventListener(
								'renderComplete'
								, (event) => f(docType + document.documentElement.outerHTML)
							);

							if(timeout)
							{
								setTimeout(
									(args) => { f(docType + document.documentElement.outerHTML) }
									, parseInt(timeout)
								);
							}

						});
					};

					// console.error(`(${listenForRenderEvent})(${settings.timeout})`);

					client.Runtime.evaluate({
						expression: `(${listenForRenderEvent})(${settings.timeout})`,
						awaitPromise: true
					}).then((result)=>{
						client.close();
						accept(result.result.value);
					}).catch((err) => {
						console.error('Client Closed due to error...');
						console.error(err);
						client.close();
					});
				});			
			});
		});
	};

	kill()
	{
		console.error('Killing chrome...');

		this.chrome.kill();
	}
}
