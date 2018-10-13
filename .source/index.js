#!/usr/bin/node
import { Browser } from './Browser';

const args     = process.argv.slice(1);
const settings = {timeout: 5000};

args.slice(1).map((arg)=>{
	let groups = /^--(\w+)=?(.+)?/.exec(arg);

	if(groups)
	{
		settings[groups[1]] = groups[2] || true;
	}
});

const single = () => {
	const url     = args[1];
	const browser = new Browser(()=>{
		if(url)
		{
			browser.prerender(url, settings).then((value)=>{
				console.log(value);
				browser.kill();
			});
		}
		else
		{
			console.error('Please supply a URL.');
			browser.kill();
		}
	});
};

const streaming = () => {
	const readline = require('readline');
	const handles  = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout,
	  terminal: false
	});
	handles.pause();

	const args     = process.argv.slice(2);

	console.error(`Prenderer is running in streaming mode!`)

	const browser = new Browser(()=>{

		const settings = {timeout: 5000};

		args.slice(1).map((arg)=>{
			let groups = /^--(\w+)=?(.+)?/.exec(arg);

			if(groups)
			{
				settings[groups[1]] = groups[2] || true;
			}
		});

		const url      = args[0];
		const promises = [];

		handles.on('line', url => {
			promises.push(browser.prerender(url, settings).then((value)=>{
				console.log(JSON.stringify(value));
			}));
		});

		handles.on('close', () => {
			Promise.all(promises).then(()=>{
				browser.kill();
			});
		});

		handles.resume();
	});
};

const daemon = () => {
	const port    = args[2] || 3003;
	const express = require('express');
	const daemon  = express();
	const browser = new Browser(()=>{

		daemon.listen(port, () => {
			console.error(`Prenderer is listening on port ${port}!`)
		});

		daemon.get('/', (req, res) => {
			if(!req.query.url)
			{
				res.send();
				return;
			}

			const settings = {timeout: req.query.timeout || 5000};

			browser.prerender(req.query.url, settings).then((value)=>{
				console.error('Sending...');
				res.send(value);
			});
		});
	});
};

switch(true)
{
	case settings['streaming']:
		streaming();
		break;
	case settings['daemon']:
		daemon();
		break;
	default:
		single();
		break;
}