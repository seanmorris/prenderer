# prenderer

Prerender your JS pages in Chrome.

[github](https://github.com/seanmorris/prenderer)

[npm](https://www.npmjs.com/package/prenderer)

[Getting Started](#getting-started)

[Installing Chrome](#installing-chrome)

## Getting Started

This module allows for *server side* rendering in chrome, meaning you can run it as a system user, say under apache or nginx.

It runs a headless instance of chrome to prerender the pages. You can either wait on a timeout for rendering to complete, or throw an event on the page to signal that prenderer should snapshot the document and move on.

It has only been tested on Debian Linux.

Usage:

Supply a url and a timeout in milliseconds.


```sh
$ prenderer http://google.com --timeout=200
```

Remove the noise:


```sh
$ prenderer http://google.com --timeout=200 2>/dev/null
```

You also can omit the timeout, and throw a "renderComplete" event in your page's JS:

```js
document.dispatchEvent(new Event('renderComplete'));
```

```sh
$ prenderer http://yourwebsite.com
```

During prerendering, the "prerenderer" cookie will be set. You can use this to detect prerendering in your page js.

## Installing Chrome

If you're in a pure CLI environment, like in SSH or Docker, you can't exactly go to google.com/chrome and click download (actually you can with lynx, but I digress).

### Add Google's key to Apt:

```sh
$ wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
```

### Install Chrome

```sh
$ apt install google-chrome-stable
```

Thats it, now prenderer is ready to use.

Go crazy.