import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as sinon from "sinon";
import { thunk } from "thunks";

chai.use(chaiAsPromised);

const expect = chai.expect;

import * as crypto from "crypto";

import { WebPInfo } from "../src/webpinfo";

describe("WebPInfo", () => {
  let sandbox: sinon.SinonSandbox;
  let parser: WebPInfo;

  beforeEach((() => {
    sandbox = sinon.createSandbox();
    parser = new WebPInfo();
  }));

  afterEach(() => {
    sandbox.verifyAndRestore();
  });

  describe("static #isAnimated", () => {
    let buf: Buffer;

    context("when given input is not animated", () => {
      beforeEach(() => {
        buf = crypto.randomBytes(65535);
        sandbox.mock(WebPInfo)
          .expects("parse")
          .withArgs(buf)
          .resolves({ chunks: [ { type: "VP8X" } ] });
      });

      it("should return false", async () => {
        expect(await WebPInfo.isAnimated(buf)).to.be.eq(false);
      });
    });

    context("when given input is animated", () => {
      beforeEach(() => {
        buf = crypto.randomBytes(65535);
        sandbox.mock(WebPInfo)
          .expects("parse")
          .withArgs(buf)
          .resolves({ chunks: [ { type: "ANMF" } ] });
      });

      it("should return true", async () => {
        expect(await WebPInfo.isAnimated(buf)).to.be.eq(true);
      });
    });
  });

  describe("static #isLossless", () => {
    let buf: Buffer;

    context("when given input is not lossless", () => {
      beforeEach(() => {
        buf = crypto.randomBytes(65535);
        sandbox.mock(WebPInfo)
          .expects("parse")
          .withArgs(buf)
          .resolves({ chunks: [ { type: "VP8" } ] });
      });

      it("should return false", async () => {
        expect(await WebPInfo.isLossless(buf)).to.be.eq(false);
      });
    });

    context("when given input is lossless", () => {
      beforeEach(() => {
        buf = crypto.randomBytes(65535);
        sandbox.mock(WebPInfo)
          .expects("parse")
          .withArgs(buf)
          .resolves({ chunks: [ { type: "VP8L" } ] });
      });

      it("should return true", async () => {
        expect(await WebPInfo.isLossless(buf)).to.be.eq(true);
      });
    });
  });

  describe("static #parse", () => {
    beforeEach(() => {
      sandbox.mock(WebPInfo.prototype)
        .expects("end");
    });

    context("when parser emits error", () => {
      beforeEach(() => {
        sandbox.mock(WebPInfo.prototype)
          .expects("on")
          .atLeast(1)
          .callsFake((eventName: string, handler: any) => {
            if (eventName === "error") {
              setTimeout(() => {
                handler(new Error("MOCKED"));
              }, 50);
            }
          });
      });

      it("should throw error", async () => {
        await expect(
          WebPInfo.parse(crypto.randomBytes(65535)),
        ).to.be.eventually.rejectedWith(Error, "MOCKED");
      });
    });

    context("when parser emits format", () => {
      beforeEach(() => {
        sandbox.mock(WebPInfo.prototype)
          .expects("on")
          .atLeast(1)
          .callsFake((eventName: string, handler: any) => {
            if (eventName === "format") {
              setTimeout(() => {
                handler({ MOCKED: true });
              }, 50);
            }
          });
      });

      it("should return parsed information", async () => {
        expect(
          await WebPInfo.parse(crypto.randomBytes(65535)),
        ).to.be.deep.eq({ MOCKED: true });
      });
    });
  });

  context("something went wrong during process stream", () => {
    it("should emit error event", (done) => {
      const onError = sandbox.spy();

      parser.on("error", onError);

      parser.end(crypto.randomBytes(16), () => {
        expect(onError.called).to.be.eq(true, "calls error event handler");

        const [ err ] = onError.getCall(0).args;
        expect(err).to.be.instanceOf(Error);

        done();
      });
    });
  });

  describe("#readBytes", () => {
    context("when stream is closed before reading requested bytes", () => {
      it("should throw error", (done) => {
        const onError = sandbox.spy();

        parser.on("error", onError);

        parser.end(Buffer.from([0x01]), () => {
          expect(onError.called).to.be.eq(true, "calls error event handler");

          const [ err ] = onError.getCall(0).args;
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.be.eq("stream is closed before read 8 bytes");
          done();
        });
      });
    });

    context("when called multiple times", () => {
      it("should throw error", (done) => {
        (parser as any).readBytes(4)((e: Error) => {
          expect(e).to.be.instanceOf(Error);
          expect(e.message).to.be.eq("there is already readBytes callback set");
          done();
        });
      });
    });
  });

  describe("#readRIFFHeader", () => {
    context("when readBytes throw error", () => {
      let underlyingError: Error;

      beforeEach(() => {
        underlyingError = new Error("MOCKED");

        sandbox.mock(parser)
          .expects("readBytes")
          .returns(thunk(
            (done: any) => { done(underlyingError); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readRIFFHeader()((e: Error) => {
          expect(e).to.be.eq(underlyingError);
          done();
        });
      });
    });

    context("with RIFF incompatible binary", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(8)
          .returns(thunk(
            crypto.randomBytes(8),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readRIFFHeader()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instanceof Error");
          expect(e.message).to.be.include("not RIFF compatible", "should be valid error message");
          done();
        });
      });
    });

    context("with RIFF compatible binary, but has too small payload size", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(8)
          .returns(thunk(
            Buffer.concat([
              createRIFFHeader(4),
              crypto.randomBytes(4),
            ]),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readRIFFHeader()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instanceof Error");
          expect(e.message).to.be.deep.eq("Invalid RIFF Chunk size", "should be valid error message");
          done();
        });
      });
    });

    context("with valid RIFF Header", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(8)
          .returns(thunk(
            createRIFFHeader(12),
          ));
      });

      it("should return RIFF Container Information", (done) => {
        (parser as any).readRIFFHeader()((e: null, riff: any) => {
          expect(e).to.be.eq(null, "should be null");

          expect(riff).to.be.deep.eq(
            { size: 20 },
            "should be RIFF information",
          );
          done();
        });
      });

      it("should emit 'riff' event with RIFF Container Information", (done) => {
        const onRIFF = sandbox.spy();

        parser.on("riff", onRIFF);

        (parser as any).readRIFFHeader()(() => {
          expect(onRIFF.called).to.be.eq(true, "should emit 'riff' event");

          const [ format ] = onRIFF.getCall(0).args;

          expect(format).to.be.deep.eq(
            { size: 20 },
            "should be RIFF information",
          );
          done();
        });
      });
    });
  });

  describe("#readWebPSignature", () => {
    context("when readBytes throw error", () => {
      let underlyingError: Error;

      beforeEach(() => {
        underlyingError = new Error("MOCKED");

        sandbox.mock(parser)
          .expects("readBytes")
          .returns(thunk(
            (done: any) => { done(underlyingError); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readWebPSignature()((e: Error) => {
          expect(e).to.be.eq(underlyingError);
          done();
        });
      });
    });

    context("without WebP signature", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(4)
          .returns(thunk(
            crypto.randomBytes(4),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readWebPSignature()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message).to.be.include("not WebP", "should be valid error message");
          done();
        });
      });
    });

    context("with WebP signature", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(4)
          .returns(thunk(
            Buffer.from("WEBP", "utf8"),
          ));
      });

      it("should pass validation", (done) => {
        (parser as any).readWebPSignature()((e: any) => {
          expect(e).to.be.eq(null, "should be null");
          done();
        });
      });
    });
  });

  describe("#readVP8Bitstream", () => {
    context("when readBytes throw error", () => {
      const underlyingErrors: Error[] = [
        new Error("MOCKED_0"),
        new Error("MOCKED_1"),
      ];

      beforeEach(() => {
        const mock = sandbox.mock(parser)
          .expects("readBytes")
          .atLeast(1);

        mock
          .onFirstCall()
          .returns(thunk(
            (done: any) => { done(underlyingErrors[0]); },
          ));

        mock
          .onSecondCall()
          .returns(thunk(
            Buffer.from([0xd2, 0xbe, 0x01]),
          ));

        mock
          .onThirdCall()
          .returns(thunk(
            (done: any) => { done(underlyingErrors[1]); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readVP8Bitstream()((e1: Error) => {
          (parser as any).readVP8Bitstream()((e2: Error) => {
            expect(e1).to.be.eq(underlyingErrors[0]);
            expect(e2).to.be.eq(underlyingErrors[1]);
            done();
          });
        });
      });
    });

    context("without keyframe", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(3)
          .returns(thunk(
            Buffer.from([0x01, 0x00, 0x00]),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readVP8Bitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("expected VP8 bitstream has keyframe", "should be valid error message");
          done();
        });
      });
    });

    context("without valid start code", () => {
      beforeEach(() => {
        const mock = sandbox.mock(parser)
          .expects("readBytes")
          .twice();

        mock.onFirstCall()
          .returns(thunk(
            Buffer.from([0xd2, 0xbe, 0x01]),
          ));

        mock.onSecondCall()
          .returns(thunk(
            crypto.randomBytes(7),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readVP8Bitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("expected VP8 intraframe start code", "should be valid error message");
          done();
        });
      });
    });

    context("with valid bitstream header", () => {
      beforeEach(() => {
        const mock = sandbox.mock(parser)
          .expects("readBytes")
          .twice();

        mock.onFirstCall()
          .returns(thunk(
            Buffer.from([0xd2, 0xbe, 0x01]),
          ));

        mock.onSecondCall()
          .returns(thunk(
            Buffer.from([0x9d, 0x01, 0x2a, 0x26, 0x02, 0x70, 0x01]),
          ));
      });

      it("should return parsed VP8 bitstream information", (done) => {
        (parser as any).readVP8Bitstream()((e: null, data: any) => {
          expect(e).to.be.eq(null, "should be null");
          expect(data).to.be.deep.eq({
            keyframe: 0,
            version: 1,
            showFrame: 1,
            firstPartSize: 3574,
            width: 550,
            horizontalScale: 0,
            height: 368,
            verticalScale: 0,
          }, "should be VP8 bitstream information");
          done();
        });
      });
    });
  });

  describe("#readVP8LBitstream", () => {
    context("when readBytes throw error", () => {
      let underlyingError: Error;

      beforeEach(() => {
        underlyingError = new Error("MOCKED");

        sandbox.mock(parser)
          .expects("readBytes")
          .returns(thunk(
            (done: any) => { done(underlyingError); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readVP8LBitstream()((e: Error) => {
          expect(e).to.be.eq(underlyingError);
          done();
        });
      });
    });

    context("without VP8L Signature", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(1)
          .returns(thunk(
            Buffer.from([0x00]),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readVP8LBitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("expected VP8L signature", "should be valid error message");
          done();
        });
      });
    });

    context("without valid version", () => {
      beforeEach(() => {
        const mock = sandbox.mock(parser)
          .expects("readBytes")
          .twice();

        mock.onFirstCall()
          .returns(thunk(
            Buffer.from([0x2f]),
          ));

        mock.onSecondCall()
          .returns(thunk(
            Buffer.from([0x00, 0x00, 0x00, 0xff]),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readVP8LBitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("expected VP8L bitstream version", "should be valid error message");
          done();
        });
      });
    });

    context("with valid bitstream header", () => {
      beforeEach(() => {
        const mock = sandbox.mock(parser)
          .expects("readBytes")
          .twice();

        mock.onFirstCall()
          .returns(thunk(
            Buffer.from([0x2f]),
          ));

        mock.onSecondCall()
          .returns(thunk(
            Buffer.from([0x7f, 0xc7, 0x0d, 0x01]),
          ));
      });

      it("should return parsed VP8 bitstream information", (done) => {
        (parser as any).readVP8LBitstream()((e: null, data: any) => {
          expect(e).to.be.eq(null, "should be null");
          expect(data).to.be.deep.eq(
            { width: 1920, height: 1080, alpha: 0, version: 0 },
            "should be VP8L bitstream information",
          );
          done();
        });
      });
    });
  });

  describe("#readVP8XBitstream", () => {
    context("when readBytes throw error", () => {
      let underlyingError: Error;

      beforeEach(() => {
        underlyingError = new Error("MOCKED");

        sandbox.mock(parser)
          .expects("readBytes")
          .returns(thunk(
            (done: any) => { done(underlyingError); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readVP8XBitstream()((e: Error) => {
          expect(e).to.be.eq(underlyingError);
          done();
        });
      });
    });

    context("without valid reserved bit 0-1", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(10)
          .returns(thunk(
            Buffer.alloc(10, 0xf0),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readVP8XBitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("First reserved bits", "should be valid error message");
          done();
        });
      });
    });

    context("without valid reserved bit 7", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(10)
          .returns(thunk(
            Buffer.alloc(10, 0x03),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readVP8XBitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("Second reserved bit", "should be valid error message");
          done();
        });
      });
    });

    context("without valid reserved bit 8-31", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(10)
          .returns(thunk(
            Buffer.from([
              0x00, 0xff, 0xff, 0xff,
              0x00, 0x00, 0x00, 0x00,
              0x00, 0x00,
            ]),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readVP8XBitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("Third reserved bit", "should be valid error message");
          done();
        });
      });
    });

    context("with valid VP8X bitstream", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(10)
          .returns(thunk(
            Buffer.from([
              0x10, 0x00, 0x00, 0x00,
              0x8f, 0x01, 0x00, 0x2c,
              0x01, 0x00,
            ]),
          ));
      });

      it("should return parsed VP8X bitstream information", (done) => {
        (parser as any).readVP8XBitstream()((e: null, data: any) => {
          expect(e).to.be.eq(null, "should be null");
          expect(data).to.be.deep.eq(
            {
              rsv1: 0, icc: 0, alpha: 1, exif: 0,
              xmp: 0, animation: 0, rsv2: 0, rsv3: 0,
              canvasWidth: 400, canvasHeight: 301,
            },
            "should be VP8X bitstream information",
          );
          done();
        });
      });
    });
  });

  describe("#readANIMBitstream", () => {
    context("when readBytes throw error", () => {
      let underlyingError: Error;

      beforeEach(() => {
        underlyingError = new Error("MOCKED");

        sandbox.mock(parser)
          .expects("readBytes")
          .returns(thunk(
            (done: any) => { done(underlyingError); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readANIMBitstream()((e: Error) => {
          expect(e).to.be.eq(underlyingError);
          done();
        });
      });
    });

    context("with valid ANIM bitstream", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(6)
          .returns(thunk(
            Buffer.from([
              0xff, 0xed, 0xb5, 0xff,
              0x00, 0x00,
            ]),
          ));
      });

      it("should return parsed ANIM bitstream information", (done) => {
        (parser as any).readANIMBitstream()((e: null, data: any) => {
          expect(e).to.be.eq(null, "should be null");
          expect(data).to.be.deep.eq(
            {
              backgroundColor: { r: 255, g: 237, b: 181, a: 255 },
              loopCount: 0,
            },
            "should be ANIM bitstream information",
          );
          done();
        });
      });
    });
  });

  describe("#readANMFBitstream", () => {
    context("when readBytes throw error", () => {
      let underlyingError: Error;

      beforeEach(() => {
        underlyingError = new Error("MOCKED");

        sandbox.mock(parser)
          .expects("readBytes")
          .returns(thunk(
            (done: any) => { done(underlyingError); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readANMFBitstream()((e: Error) => {
          expect(e).to.be.eq(underlyingError);
          done();
        });
      });
    });

    context("without valid reserved bits", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(16)
          .returns(thunk(
            Buffer.alloc(0xf0, 16),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readANMFBitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("reserved bits", "should be valid error message");
          done();
        });
      });
    });

    context("with valid ANMF bitstream", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(16)
          .returns(thunk(
            Buffer.from([
              0x00, 0x00, 0x00, 0x00,
              0x00, 0x00, 0xc7, 0x00,
              0x00, 0xc7, 0x00, 0x00,
              0x1e, 0x00, 0x00, 0x02,
            ]),
          ));
      });

      it("should return parsed ANMF bitstream information", (done) => {
        (parser as any).readANMFBitstream()((e: null, data: any) => {
          expect(e).to.be.eq(null, "should be null");
          expect(data).to.be.deep.eq(
            {
              offsetX: 0, offsetY: 0,
              width: 200, height: 200,
              duration: 30, rsv1: 0,
              blending: 0, disposal: 0,
            },
            "should be ANMF bitstream information",
          );
          done();
        });
      });
    });
  });

  describe("#readALPHBitstream", () => {
    context("when readBytes throw error", () => {
      let underlyingError: Error;

      beforeEach(() => {
        underlyingError = new Error("MOCKED");

        sandbox.mock(parser)
          .expects("readBytes")
          .returns(thunk(
            (done: any) => { done(underlyingError); },
          ));
      });

      it("should re-throw error", (done) => {
        (parser as any).readALPHBitstream()((e: Error) => {
          expect(e).to.be.eq(underlyingError);
          done();
        });
      });
    });

    context("without valid reserved bits", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(1)
          .returns(thunk(
            Buffer.from([0xff]),
          ));
      });

      it("should throw error", (done) => {
        (parser as any).readALPHBitstream()((e: Error) => {
          expect(e).to.be.instanceof(Error, "should be instance of Error");
          expect(e.message)
            .to.be.include("reserved bits", "should be valid error message");
          done();
        });
      });
    });

    context("with valid ALPH bitstream", () => {
      beforeEach(() => {
        sandbox.mock(parser)
          .expects("readBytes")
          .withArgs(1)
          .returns(thunk(
            Buffer.from([0x01]),
          ));
      });

      it("should return parsed ALPH bitstream information", (done) => {
        (parser as any).readALPHBitstream()((e: null, data: any) => {
          expect(e).to.be.eq(null, "should be null");
          expect(data).to.be.deep.eq(
            { rsv1: 0, preprocessing: 0, filtering: 0, compression: 1 },
            "should be ALPH bitstream information",
          );
          done();
        });
      });
    });
  });
});

function createRIFFHeader(size: number, fourCC = "RIFF") {
  return Buffer.concat([
    Buffer.from(fourCC, "utf8"),
    (() => {
      const bufSize = Buffer.alloc(4, 0);

      bufSize.writeUInt32LE(size, 0);

      return bufSize;
    })(),
  ]);
}
