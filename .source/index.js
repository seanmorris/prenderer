#!/usr/bin/node

import { Browser } from './Browser';

const args = process.argv.slice(2);

const browser = new Browser((b)=>{

	const url = args[0];

	browser.goto(url).then(()=>{
		const setPrerenderCookie = () => {
			document.cookie = `prerenderer=prenderer`;
		};

		b.Runtime.evaluate({
			expression: `(${setPrerenderCookie})()`,
		});

		const listenForRenderEvent = () => {
			return new Promise((f,r)=>{
				let docType = document.doctype
					? new XMLSerializer().serializeToString(document.doctype)
						+ "\n"
					: '';
				
				document.addEventListener(
					'renderComplete'
					, (event) => f(docType + document.documentElement.outerHTML)
				);

				let timeout = setTimeout(
					(args) => { f(docType + document.documentElement.outerHTML) }
					, 5000
				);
			});
		};

		b.Runtime.evaluate({
			expression: `(${listenForRenderEvent})()`,
			awaitPromise: true
		}).then((result)=>{
			console.log(result.result.value);

			browser.kill();
		});
	});

});
