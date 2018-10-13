# prenderer

Prerender your JS pages in Chrome.

[github](https://github.com/seanmorris/prenderer)

[npm](https://www.npmjs.com/package/prenderer)

[Getting Started](#getting-started)

[Daemon](#daemon)

[Installing Chrome](#installing-chrome)

## Getting Started

This module allows for *server side* rendering in chrome, meaning you can run it as a system user, say under apache or nginx.

It runs a headless instance of chrome to prerender the pages. You can either wait on a timeout for rendering to complete, or throw an event on the page to signal that Prenderer should snapshot the document and move on.

It has only been tested on Debian Linux.

Install:

```sh
$ npm i -g prenderer
```

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

## Daemon

Use the following command to run Prenderer in daemon mode. If no port number is supplied, 3003 will be used.

```sh
$ prenderer --daemon 3003
```

Use URLS like the following to prerender over the network:

```
http://localhost:3003/?url=http://yahoo.com
```

## Streaming

Run Prenderer in streaming mode with the following command:

```
$ prenderer --streaming
```

In this mode, Prenderer will load URLs from STDIN, separated by newlines.

Results will also be one line each, as newlines are escaped.

## Installing Chrome

If you're in a pure CLI environment, like in SSH or Docker, you can't exactly go to google.com/chrome and click download (actually you can with lynx, but I digress).

### Add Google's key to Apt:

```sh
$ wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
```

### Add the repo to your sources & update apt:

```sh
$ echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list

$ apt-get update
```
### Install Chrome

```sh
$ apt install google-chrome-stable
```

#### Install Prenderer:

```sh
$ npm i -g prenderer
```

Thats it, now prenderer is ready to use.

Go crazy.