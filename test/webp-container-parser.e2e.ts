import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const expect = chai.expect;

import * as fs from "fs";
import * as path from "path";

import { WebPInfo } from "../src/webpinfo";

describe("WebPInfo E2E", () => {
  let parser: WebPInfo;

  beforeEach((() => {
    parser = new WebPInfo();
  }));

  describe("#parse", () => {
    describe("Simple Lossy Format (VP8)", () => {
      it("should return information", async () => {
        expect(
          await WebPInfo.from(
            fs.readFileSync(path.join(__dirname, "lossy.webp")),
          ),
        ).to.be.deep.eq(
          require("./lossy").format,
        );

        expect(
          await WebPInfo.from("http://www.gstatic.com/webp/gallery/1.webp"),
        ).to.be.deep.eq(
          require("./lossy").format,
        );
      });
    });

    describe("Simple Lossless Format (VP8L)", () => {
      it("should return information", async () => {
        expect(
          await WebPInfo.from(
            fs.readFileSync(path.join(__dirname, "lossless.webp")),
          ),
        ).to.be.deep.eq(
          require("./lossless").format,
        );

        expect(
          await WebPInfo.from(
            path.join(__dirname, "yellow-rose-lossless-with-alpha.webp"),
          ),
        ).to.be.deep.eq(
          require("./yellow-rose-lossless-with-alpha").format,
        );
      });
    });

    describe("Extended Format (VP8X / Animated)", () => {
      it("should return information", async () => {
        expect(
          await WebPInfo.from(
            fs.readFileSync(path.join(__dirname, "animated.webp")),
          ),
        ).to.be.deep.eq(
          require("./animated").format,
        );
      });
    });

    describe("Extended Format (VP8X / ICC Profile)", () => {
      it("should return information", async () => {
        expect(
          await WebPInfo.from(
            fs.readFileSync(path.join(__dirname, "icc.webp")),
          ),
        ).to.be.deep.eq(
          require("./icc").format,
        );
      });
    });

    describe("Extended Format (VP8X / EXIF)", () => {
      it("should return information", async () => {
        expect(
          await WebPInfo.from(
            path.join(__dirname, "exif-jeju.webp"),
          ),
        ).to.be.deep.eq(
          require("./exif-jeju").format,
        );
      });
    });

    describe("Extended Format (VP8X / Alpha)", () => {
      it("should return information", async () => {
        expect(
          await WebPInfo.from(
            fs.readFileSync(path.join(__dirname, "yellow-rose-lossy-with-alpha.webp")),
          ),
        ).to.be.deep.eq(
          require("./yellow-rose-lossy-with-alpha").format,
        );
      });
    });
  });
});
