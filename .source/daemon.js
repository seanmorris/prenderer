#!/usr/bin/node

import { Browser } from './Browser';

const express = require('express');
const daemon  = express();
const browser = new Browser(()=>{

	daemon.listen(3000, () => {
		console.log('Prenderer listening on port 3000!')
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
			res.set('Content-Type', 'text/plain');
			res.send(value);
		});
	});

	// const url      = args[0];
	// const settings = {timeout: 5000};

	// args.slice(1).map((arg)=>{
	// 	let groups = /^--(\w+)=?(.+)?/.exec(arg);

	// 	if(groups)
	// 	{
	// 		settings[groups[1]] = groups[2] || true;
	// 	}
	// });

	// browser.prerender(url, settings).then((value)=>{
	// 	console.log(value);
	// });
});
