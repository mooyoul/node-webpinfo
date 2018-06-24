# node-webpinfo

[![Build Status](https://travis-ci.org/mooyoul/node-webpinfo.svg?branch=master)](https://travis-ci.org/mooyoul/node-webpinfo)
[![Coverage Status](https://coveralls.io/repos/github/mooyoul/node-webpinfo/badge.svg?branch=master)](https://coveralls.io/github/mooyoul/node-webpinfo?branch=master)
[![codecov.io](https://codecov.io/github/mooyoul/node-webpinfo/coverage.svg?branch=master)](https://codecov.io/github/mooyoul/node-webpinfo?branch=master)
[![Dependency Status](https://david-dm.org/mooyoul/node-webpinfo.svg)](https://david-dm.org/mooyoul/node-webpinfo)
[![devDependency Status](https://david-dm.org/mooyoul/node-webpinfo/dev-status.svg)](https://david-dm.org/mooyoul/node-webpinfo#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/mooyoul/node-webpinfo/badge.svg)](https://snyk.io/test/github/mooyoul/node-webpinfo)
[![MIT license](http://img.shields.io/badge/license-MIT-blue.svg)](http://mooyoul.mit-license.org/)

Node.js Stream based WebP Container Parser.

node-webpinfo | webpinfo (libwebp) 
---------------- | ----------------
[![Output of node-webpinfo](https://raw.githubusercontent.com/mooyoul/node-webpinfo/master/examples/output-node-webpinfo.png)] | [![Output of webpinfo](https://raw.githubusercontent.com/mooyoul/node-webpinfo/master/examples/output-libwebp-webpinfo.png)]


## Install

```bash
$ npm install webpinfo
```
 
 
## Supported WebP Formats

- Simple File Format (Lossy)
- Simple File Format (Lossless)
- Extended File Format (e.g. Animated WebP)

## Supported WebP Chunks

- VP8
- VP8L
- VP8X
- ANIM
- ANMF
- ALPH
- ICCP
- EXIF
- XMP
    
 
## Usage

## Promise interface

```typescript
import { WebPInfo } from "webpinfo";

// IMPORTANT: buf should be instance of Buffer.
const info = await WebPInfo.parse(buf);
console.log("INFO: ", info);
```

## Stream interface

```typescript
import * as http from "http";
import { WebPInfo } from "webpinfo";

http.get("http://www.gstatic.com/webp/gallery/1.webp", (res) => {
  if (res.statusCode !== 200) {
    console.log("unexpected status code: ", res.statusCode);
    return;
  }

  res.pipe(new WebPInfo())
    .on("error", (e) => console.log("error", e))
    .on("riff", (riff) => console.log("riff", riff))
    .on("chunk", (chunk) => console.log("chunk", chunk))
    .on("format", (format) => console.log("format", format));
});
```

## API

### Please refer detailed type definitions on [src/webpinfo.ts](https://github.com/mooyoul/node-webpinfo/blob/a1731f6b062c66534018843ac3b644959d5b02ac/src/webpinfo.ts#L132-L225).

### `WebPInfo` => [`WritableStream`](https://github.com/mooyoul/node-webpinfo/blob/a1731f6b062c66534018843ac3b644959d5b02ac/src/webpinfo.ts#L228)

Basically WebPInfo is `WritableStream`.


### `WebPInfo.parse(buf: Buffer)` => [`Promise<WebP>`](https://github.com/mooyoul/node-webpinfo/blob/a1731f6b062c66534018843ac3b644959d5b02ac/src/webpinfo.ts#L216-L225)
 
Parse WebPInfo from given Buffer.


### `WebPInfo.isAnimated(buf: Buffer)` => `Promise<boolean>`

Return true if given buffer contains any animation frame.

### `WebPInfo.isLossless(buf: Buffer)` => `Promise<boolean>`

Return true if given buffer contains VP8L chunk.


## Stream Events

### `riff`

- Event Payload: [`RIFFContainer`](https://github.com/mooyoul/node-webpinfo/blob/a1731f6b062c66534018843ac3b644959d5b02ac/src/webpinfo.ts#L63-L65)

emitted after parsing riff header.


### `chunk`

- Event Payload: [`WebPChunk`](https://github.com/mooyoul/node-webpinfo/blob/a1731f6b062c66534018843ac3b644959d5b02ac/src/webpinfo.ts#L205-L214)

emitted after parsing WebP chunk

### `format`

- Event Payload: [`WebP`](https://github.com/mooyoul/node-webpinfo/blob/a1731f6b062c66534018843ac3b644959d5b02ac/src/webpinfo.ts#L216-L225)

emitted after all WebP chunks have parsed


## Debugging

Set `DEBUG` environment variable to `webpinfo`.
You will be able to see debug messages on your console.

> $ env DEBUG='webpinfo' node your-app.js
 

## Testing

> $ npm run test

... OR

> $ npm run lint

> $ npm run coverage



## Build

> $ npm run build


## License
[MIT](LICENSE)

See full license on [mooyoul.mit-license.org](http://mooyoul.mit-license.org/)
