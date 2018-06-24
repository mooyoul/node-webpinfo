# node-webpinfo

[![Build Status](https://travis-ci.org/mooyoul/node-webpinfo.svg?branch=master)](https://travis-ci.org/mooyoul/node-kiturami)
[![Coverage Status](https://coveralls.io/repos/github/mooyoul/node-webpinfo/badge.svg?branch=master)](https://coveralls.io/github/mooyoul/node-kiturami?branch=master)
[![codecov.io](https://codecov.io/github/mooyoul/node-webpinfo/coverage.svg?branch=master)](https://codecov.io/github/mooyoul/node-kiturami?branch=master)
[![Dependency Status](https://david-dm.org/mooyoul/node-webpinfo.svg)](https://david-dm.org/mooyoul/node-kiturami)
[![devDependency Status](https://david-dm.org/mooyoul/node-webpinfo/dev-status.svg)](https://david-dm.org/mooyoul/node-kiturami#info=devDependencies)
[![Known Vulnerabilities](https://snyk.io/test/github/mooyoul/node-webpinfo/badge.svg)](https://snyk.io/test/github/mooyoul/node-kiturami)
[![MIT license](http://img.shields.io/badge/license-MIT-blue.svg)](http://mooyoul.mit-license.org/)

Node.js Stream based WebP Container Parser.


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

## Please refer detailed type definitions on here.

## `WebPInfo` => `WtiableStream`

Basically WebPInfo is `WritableStream`.


## `WebPInfo.parse(buf: Buffer) => Promies<WebPInfo>`
 
Parse WebPInfo from given Buffer


## `WebPInfo.isAnimated(buf: Buffer) => Promise<boolean>`

Return true if given buffer contains any animation frame.

## `WebPInfo.isLossless(buf: Buffer) => Promise<boolean>`

Returns true if given buffer contains VP8L chunk.


## Stream Events

### `riff`

- Event Payload: `RIFFContainer`

emitted after parsing riff header.


### `chunk`

- Event Payload: `WebPChunk`

emitted after parsing WebP chunk

## `format`

- Event Payload: `WebP`

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
