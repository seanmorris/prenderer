import { Browser } from './Browser';

const browser = new Browser((b)=>{
	browser.goto('https://isotope.seanmorr.is/').then((x)=>{
		const browserCode = ()=>{
			return new Promise((f,r)=>{
				document.addEventListener(
					'renderComplete'
					, (event) => f('Render Complete!')
				);

				setTimeout(
					()=>{
						const event = new Event('renderComplete');
						document.dispatchEvent(event);
					}
					, 2500
				);
			});
		};

		b.Runtime.evaluate({
			expression: `(${browserCode})()`,
			awaitPromise: true
		}).then((x)=>{
			b.Runtime.evaluate({
				expression: 'document.documentElement.outerHTML'
			}).then((x)=>{
				console.log(x.result.value);

				browser.kill();
			});
		});
	});
});
