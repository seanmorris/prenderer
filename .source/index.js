#!/usr/bin/node

import { Browser } from './Browser';

const args = process.argv.slice(2);

const browser = new Browser((b)=>{

	const url      = args[0];
	const settings = {timeout: 5000};

	args.slice(1).map((arg)=>{
		let groups = /^--(\w+)=?(.+)?/.exec(arg);

		if(groups)
		{
			settings[groups[1]] = groups[2] || true;
		}
	});

	console.error(settings);

	browser.goto(url).then(()=>{
		const setPrerenderCookie = () => {
			document.cookie = `prerenderer=prenderer`;
		};

		b.Runtime.evaluate({
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

		console.error(`(${listenForRenderEvent})(${settings.timeout})`);

		b.Runtime.evaluate({
			expression: `(${listenForRenderEvent})(${settings.timeout})`,
			awaitPromise: true
		}).then((result)=>{
			console.log(result.result.value);

			browser.kill();
		});
	});

});
