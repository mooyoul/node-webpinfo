import { expect } from "chai";

import * as pkg from "../src";
import { WebPInfo } from "../src/webpinfo";

describe("Package", () => {
  it("should export WebPInfo module", () => {
    expect(pkg.WebPInfo).to.be.eq(WebPInfo);
  });
});
