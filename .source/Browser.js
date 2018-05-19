import { launch } from 'chrome-launcher';
// import { CDP    } from 'chrome-remote-interface';

const CDP = require('chrome-remote-interface');

export class Browser
{
	constructor(ready)
	{
		console.error('Starting chrome...');

		const defaults = [
			'--disable-gpu'
			, '--headless'
		];

		this.cdpClient = null;

		this.chrome = launch({
			chromeFlags: defaults
		}).then(chrome => {
			this.chrome = chrome;

			this.port = chrome.port;
			
			console.error('Debug port: ' + this.port);

			this.connect(ready);
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

			return this.connected(this.cdpClient, ready);	
		});		

		// CDP({port: this.port}, (client) => {
		// 	
		// 	this.connected(client, ready);	
		// }).on('error', (err) => {
		// 	console.error(err);
		// });
	}

	connected(client, ready)
	{
		const {Network, Page} = client;
		
		Network.requestWillBeSent((params) => {
			console.error('Loading: ' + params.request.url);
		});
		
		Page.loadEventFired((params) => {
			// console.error(params);
			// console.error('Client Closed...');
			// client.close();
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