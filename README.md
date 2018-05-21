# prenderer

Prerender your JS pages in Chrome.

[github](https://github.com/seanmorris/prenderer)
[npm](https://www.npmjs.com/package/prenderer)

Usage:

```
prenderer http://google.com --timeout=200
```

Supply a url and a timeout in milliseconds.

You also can omit the timeout, and throw a "renderComplete" event in your page's JS:

```
document.dispatchEvent(new Event('renderComplete'));
```