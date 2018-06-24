import * as debug from "debug";
import * as fs from "fs";

import { WebPInfo } from "../src";

const LOG_TAG = "stream-parser:example:usage";
debug.enable(LOG_TAG);
const log = debug(LOG_TAG);

fs.createReadStream(process.argv[2])
  .pipe(new WebPInfo())
  .on("error", (e) => log("error", e))
  .on("riff", (riff) => log("riff", riff))
  .on("chunk", (chunk) => log("chunk", chunk))
  .on("format", (format) => log("format", format));
