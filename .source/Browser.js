import { launch } from 'chrome-launcher';

const CDP = require('chrome-remote-interface');
const os  = require('os');
const fs  = require('fs');

const NOT_HEADLESS = parseInt(process.env.NOT_HEADLESS);
const DONT_UNLOAD  = parseInt(process.env.DONT_UNLOAD);

export class Browser
{
	constructor(init)
	{
		const defaults = [
			'--no-sandbox'
			, NOT_HEADLESS ? null : '--disable-gpu'
			, NOT_HEADLESS ? null : '--headless'
			, '--enable-automation'
			, '--blink-settings=imagesEnabled=false'
		].filter(x=>x);

		const path = os.tmpdir() + '/.chrome-user';

		fs.mkdir(path, () => {
			// console.error('Userdir exists...' + "\n");
			this.chrome = launch({
				chromeFlags: defaults
				, 'userDataDir': path
				, envVars: {'HOME' : path, DISPLAY: ':0'}
			}).then(chrome => {
				// console.error('Started chrome, connecting...' + "\n");
				this.chrome = chrome;

				this.port = chrome.port;

				// console.error('Debug port: ' + this.port);

				init();
			}).catch(error => {
				console.error(error);
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
					const clearCookies = () => {
						0;
					};

					const setPrerenderFlag = () => {
						window.prerenderer = `prenderer`;
					};

					client.Runtime.evaluate({
						expression: `(${setPrerenderFlag})()`,
					});

					const listenForRenderEvent = (timeout) => {
						return new Promise((f,r)=>{
							document.addEventListener(
								'renderComplete'
								, (event) => {
									let docType = document.doctype
										? new XMLSerializer().serializeToString(document.doctype)
											+ "\n"
										: '';

									const result = docType + document.documentElement.outerHTML;

									f(result);
								}
							);

							document.addEventListener(
								'renderFail'
								, (event) => {
									let docType = document.doctype
										? new XMLSerializer().serializeToString(document.doctype)
											+ "\n"
										: '';

									const result = docType + document.documentElement.outerHTML;

									r(result);
								}
							);

							if(timeout)
							{
								setTimeout(
									(args) => {
										let docType = document.doctype
											? new XMLSerializer().serializeToString(document.doctype)
												+ "\n"
											: '';

										const result = docType + document.documentElement.outerHTML;

										f(result);
									}
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
						DONT_UNLOAD || client.Page.navigate({url:'about:blank'});
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
