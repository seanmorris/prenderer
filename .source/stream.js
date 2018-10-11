#!/usr/bin/node

import { Browser } from './Browser';

const readline = require('readline');
const handles  = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
handles.pause();

const args     = process.argv.slice(2);

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
