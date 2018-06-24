import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const expect = chai.expect;

import * as pkg from "../src";
import { WebPInfo } from "../src/webpinfo";

describe("Package", () => {
  it("should export WebPInfo module", () => {
    expect(pkg.WebPInfo).to.be.eq(WebPInfo);
  });
});
