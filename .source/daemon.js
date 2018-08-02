#!/usr/bin/node

import { Browser } from './Browser';

const args    = process.argv.slice(2);
const port    = args[0] || 3000;
const express = require('express');
const daemon  = express();
const browser = new Browser(()=>{

	daemon.listen(port, () => {
		console.log(`Prenderer listening on port ${port}!`)
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
