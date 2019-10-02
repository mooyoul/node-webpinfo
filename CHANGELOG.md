# [2.0.0](https://github.com/mooyoul/node-webpinfo/compare/v1.3.0...v2.0.0) (2019-10-02)


### Build System

* drop Node.js 6 support ([4509ca4](https://github.com/mooyoul/node-webpinfo/commit/4509ca4))


### BREAKING CHANGES

* Drop Node.js 6 support

## 1.3.0

- Added `width`, `height`, `isAnimated`, `isLossless`, `hasAlpha` field to format summary  

## 1.2.0

- **BREAKING** Rename `WebPInfo#parse` to `WebPInfo#from`.  

## 1.1.1

- fixed parser miscalculates `duration` of `ANMF` chunk.
  - If actual ANMF duration is 60(ms), parser reported duration as 61(ms), not 60.

## 1.1.0

- Now `WebPInfo#parse`, `WebPInfo#isAnimated`, `WebPInfo#isLossless` methods can accept not only Buffer but also Local File Path, URL, and ReadableStream.


## 1.0.4

- Initial Release
