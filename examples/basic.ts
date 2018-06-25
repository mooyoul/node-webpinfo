import * as fs from "fs";

import { WebPInfo } from "../src";

// tslint:disable:no-console
(async () => {
  const filePath = process.argv[2];

  const parsed = await WebPInfo.from(filePath);

  console.log("parsed: ", parsed);
})().catch(console.error);
// tslint:enable:no-console
