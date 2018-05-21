# prenderer

Prerender your JS pages in Chrome.

[github](https://github.com/seanmorris/prenderer)
[npm](https://www.npmjs.com/package/prenderer)

Usage:

```sh
prenderer http://google.com --timeout=200
```

Remove the noise:


```sh
prenderer http://google.com --timeout=200 2>/dev/null
```

Supply a url and a timeout in milliseconds.

You also can omit the timeout, and throw a "renderComplete" event in your page's JS:

```js
document.dispatchEvent(new Event('renderComplete'));
```

```sh
prenderer http://yourwebsite.com
```

During prerendering, the "prerenderer" cookie will be set. You can use this to detect prerendering in your page js.
