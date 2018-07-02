#!/usr/bin/node

import { Browser } from './Browser';

const args = process.argv.slice(2);

const browser = new Browser(()=>{

	const url      = args[0];
	const settings = {timeout: 5000};

	args.slice(1).map((arg)=>{
		let groups = /^--(\w+)=?(.+)?/.exec(arg);

		if(groups)
		{
			settings[groups[1]] = groups[2] || true;
		}
	});

	browser.prerender(url, settings).then((value)=>{
		console.log(value);
		browser.kill();
	});
});
