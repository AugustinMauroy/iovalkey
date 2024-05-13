import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as sinon from "sinon";
import { print } from "../../lib/index.ts";

describe("index", () => {
  describe("print()", () => {
    it("prints logs", () => {
      const stub = sinon.stub(console, "log");
      print(new Error("err"));
      print(null, "success");
      assert.strictEqual(stub.calledTwice, true);
      stub.restore();
    });
  });
});
