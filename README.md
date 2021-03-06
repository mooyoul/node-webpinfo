# node-webpinfo

[![Build Status](https://github.com/mooyoul/node-webpinfo/workflows/workflow/badge.svg)](https://github.com/mooyoul/node-webpinfo/actions)
[![Coverage Status](https://coveralls.io/repos/github/mooyoul/node-webpinfo/badge.svg?branch=master)](https://coveralls.io/github/mooyoul/node-webpinfo?branch=master)
[![codecov.io](https://codecov.io/github/mooyoul/node-webpinfo/coverage.svg?branch=master)](https://codecov.io/github/mooyoul/node-webpinfo?branch=master)
[![Semantic Release enabled](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![Known Vulnerabilities](https://snyk.io/test/github/mooyoul/node-webpinfo/badge.svg)](https://snyk.io/test/github/mooyoul/node-webpinfo)
[![MIT license](http://img.shields.io/badge/license-MIT-blue.svg)](http://mooyoul.mit-license.org/)

Node.js Stream based WebP Container Parser.

node-webpinfo [Example](https://github.com/mooyoul/node-webpinfo/blob/master/examples/webpinfo.ts) | webpinfo (libwebp) 
---------------- | ----------------
![Output of node-webpinfo](https://raw.githubusercontent.com/mooyoul/node-webpinfo/master/examples/output-node-webpinfo.png) | ![Output of webpinfo](https://raw.githubusercontent.com/mooyoul/node-webpinfo/master/examples/output-libwebp-webpinfo.png)


## Sponsor

- [Vingle](https://www.vingle.net) - Vingle, Very Community. Love the things that you love. - [We're hiring!](https://careers.vingle.net/#/engineering/backend)


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

// local file path
const info = await WebPInfo.from("/some/local/file/path.webp");
// url
const info = await WebPInfo.from("https://example.com/some/file/path.webp");
// buffer
const info = await WebPInfo.from(buf);
// readable stream
const info = await WebPInfo.from(fs.createReadStream(path));
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

### Please refer detailed type definitions on [src/webpinfo.ts](https://github.com/mooyoul/node-webpinfo/blob/4bb7fb281ac23b23ed74016463646ec0835f32f2/src/webpinfo.ts#L138-L237).

### `WebPInfo` => [`WritableStream`](https://github.com/mooyoul/node-webpinfo/blob/4bb7fb281ac23b23ed74016463646ec0835f32f2/src/webpinfo.ts#L240)

Basically WebPInfo is `WritableStream`.


### `WebPInfo.from(input: string | Buffer | ReadableStream)` => [`Promise<WebP>`](https://github.com/mooyoul/node-webpinfo/blob/4bb7fb281ac23b23ed74016463646ec0835f32f2/src/webpinfo.ts#L223-L237)
 
Parse WebPInfo from given input.
Input can be local file path, url, Buffer, or Readable Stream.


### `WebPInfo.isAnimated(input: string | Buffer | ReadableStream)` => `Promise<boolean>`

Return true if given input contains any animation frame.

### `WebPInfo.isLossless(input: string | Buffer | ReadableStream)` => `Promise<boolean>`

Return true if given buffer contains VP8L chunk.


## Stream Events

### `riff`

- Event Payload: [`RIFFContainer`](https://github.com/mooyoul/node-webpinfo/blob/4bb7fb281ac23b23ed74016463646ec0835f32f2/src/webpinfo.ts#L69-L71)

emitted after parsing riff header.


### `chunk`

- Event Payload: [`WebPChunk`](https://github.com/mooyoul/node-webpinfo/blob/4bb7fb281ac23b23ed74016463646ec0835f32f2/src/webpinfo.ts#L212-L221)

emitted after parsing WebP chunk

### `format`

- Event Payload: [`WebP`](https://github.com/mooyoul/node-webpinfo/blob/4bb7fb281ac23b23ed74016463646ec0835f32f2/src/webpinfo.ts#L223-L237)

emitted after all WebP chunks have parsed


## Related

- [mooyoul/is-webp-extended](https://github.com/mooyoul/is-webp-extended) - Extended version of `is-webp` package which supports Animated WebP. Compatible with Browser environment (e.g. `File`, `ArrayBuffer`)


## Changelog

See [CHANGELOG](/CHANGELOG.md).


## Debugging

Set `DEBUG` environment variable to `webpinfo`.
You will be able to see debug messages on your console.

> $ env DEBUG='webpinfo' node your-app.js
 

## Testing

```bash
$ npm run test
```

... OR

```bash
$ npm run lint # Check lint
$ npm run coverage # Run test & generate code coverage report
```


## Build

```bash
$ npm run build
```

## License
[MIT](LICENSE)

See full license on [mooyoul.mit-license.org](http://mooyoul.mit-license.org/)
