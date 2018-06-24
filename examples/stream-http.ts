import * as http from "http";
import { WebPInfo } from "../src";

// tslint:disable:no-console
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
// tslint:enable:no-console
