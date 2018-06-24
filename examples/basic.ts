import * as fs from "fs";

import { WebPInfo } from "../src";

// tslint:disable:no-console
(async () => {
  const filePath = process.argv[2];

  const buf = await readFile(filePath);

  const parsed = await WebPInfo.parse(buf);

  console.log("parsed: ", parsed);
})().catch(console.error);
// tslint:enable:no-console

function readFile(path: string) {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(path, { encoding: null }, (e, data) => {
      if (e) {
        return reject(e);
      }

      resolve(data);
    });
  });
}
