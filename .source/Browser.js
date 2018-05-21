import { launch } from 'chrome-launcher';

const CDP = require('chrome-remote-interface');
const os  = require('os');
const fs  = require('fs');

export class Browser
{
	constructor(ready)
	{
		console.error('Starting chrome...');

		const defaults = [
			'--no-sandbox'
			, '--disable-gpu'
			, '--headless'
			, '--enable-automation'
		];

		this.cdpClient = null;

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

				this.connect(ready);
			});
		});
	}

	connect(ready)
	{
		if(this.cdpClient)
		{
			return this.connected(this.cdpClient, ready);
		}

		return CDP({port: this.port}).then(client=>{
			this.cdpClient = client;

			const {Network, Page} = client;

			Network.requestWillBeSent((params) => {
				console.error('Loading: ' + params.request.url);
			});

			Page.loadEventFired((params) => {
				// console.error(params);
				// console.error('Client Closed...');
				// client.close();
			});

			return this.connected(this.cdpClient, ready);
		});
	}

	connected(client, ready)
	{
		const {Network, Page} = client;

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
	}

	kill()
	{
		console.error('Killing chrome...');

		this.chrome.kill();
	}

	goto(url)
	{
		return new Promise((accept, reject) =>{
			this.connect((client)=>{
				console.error('Goto ' + url)
				client.Page.navigate({url}).then(()=>{
					accept(client);
				});
			})
		});
	}
}
