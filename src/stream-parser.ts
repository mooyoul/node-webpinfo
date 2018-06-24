import * as Stream from "stream";
const StreamParser = require("stream-parser") as any; // tslint:disable-line

export interface IStreamParserWritable { // tslint:disable-line
  new(...args: any[]): IStreamParserWritableBase;
}

export interface IStreamParserWritableBase { // tslint:disable-line
  _bytes(n: number, cb: (buf: Buffer) => void): void;
  _skipBytes(n: number, cb: () => void): void;
}

class StreamParserWritableClass extends Stream.Writable {
  constructor() {
    super();
    StreamParser(this);
  }
}

// HACK: The "stream-parser" module *patches* prototype of given class on call
// So basically original class does not have any definition about stream-parser injected methods.
// thus that's why we cast type here
export const StreamParserWritable = StreamParserWritableClass as typeof Stream.Writable & IStreamParserWritable;
