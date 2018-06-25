import * as fs from "fs";

import { WebPInfo } from "../src";

// tslint:disable:no-console
(async () => {
  const filePath = process.argv[2];

  const parsed = await WebPInfo.from(filePath);

  console.log([
    `File: ${filePath}`,
    `RIFF HEADER:`,
    `  File size: ${parsed.riff.size}`,
  ].join("\n"));

  const ignored = new Map([
    ["type", true],
    ["offset", true],
    ["size", true],
    ["bitstream", true],
  ]);

  parsed.chunks.forEach((chunk) => {
    console.log([
      `Chunk ${chunk.type} at offset\t${chunk.offset}, length\t${chunk.size}`,
      Object.keys(chunk)
        .filter((name) => !ignored.has(name))
        .map((name) => `  ${name}: ${(chunk as any)[name]}`)
        .join("\n"),
    ].join("\n"));
  });

  const chunkCounts = Object.keys(parsed.summary.chunks)
    .map((t) => (parsed.summary.chunks as any)[t])
    .map((t) => `    ${t}`.slice(Math.min(-4, -t.length)));

  const chunkType = Object.keys(parsed.summary.chunks)
    .map((t, i) => `${Array.from(new Array(chunkCounts[i].length - t.length)).map(() => " ").join("")}${t}`);

  console.log([
    "Summary:",
    `Number of frames: ${parsed.summary.frames}`,
    `Chunk type  : ${chunkType.join(" ")}`,
    `Chunk counts: ${chunkCounts.join(" ")}`,
    "No error detected.",
  ].join("\n"));
})().catch(console.error);
// tslint:enable:no-console
