import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import * as sinon from "sinon";
import * as utils from "../../lib/utils/index.ts";
import TLSProfiles from "../../lib/constants/TLSProfiles.ts";

describe("utils", () => {
  describe(".convertBufferToString", () => {
    it("should return correctly", () => {
      assert.strictEqual(utils.convertBufferToString(Buffer.from("123")), "123");
      assert.deepStrictEqual(
        utils.convertBufferToString([Buffer.from("abc"), Buffer.from("abc")]),
        ["abc", "abc"]
      );
      assert.deepStrictEqual(
        utils.convertBufferToString([
          Buffer.from("abc"),
          [[Buffer.from("abc")]],
        ]),
        ["abc", [["abc"]]]
      );
      assert.deepStrictEqual(
        utils.convertBufferToString([
          Buffer.from("abc"),
          5,
          "b",
          [[Buffer.from("abc"), 4]],
        ]),
        ["abc", 5, "b", [["abc", 4]]]
      );
    });
  });

  describe(".wrapMultiResult", () => {
    it("should return correctly", () => {
      assert.deepStrictEqual(utils.wrapMultiResult(null), null);
      assert.deepStrictEqual(utils.wrapMultiResult([1, 2]), [
        [null, 1],
        [null, 2],
      ]);
      const error = new Error("2");
      assert.deepStrictEqual(utils.wrapMultiResult([1, 2, error]), [
        [null, 1],
        [null, 2],
        [error],
      ]);
    });
  });

  describe(".isInt", () => {
    it("should return correctly", () => {
      assert.strictEqual(utils.isInt(2), true);
      assert.strictEqual(utils.isInt("2231"), true);
      assert.strictEqual(utils.isInt("s"), false);
      assert.strictEqual(utils.isInt("1s"), false);
    });
  });

  describe(".packObject", () => {
    it("should return correctly", () => {
      assert.deepStrictEqual(utils.packObject([1, 2]), { 1: 2 });
      assert.deepStrictEqual(utils.packObject([1, "2"]), { 1: "2" });
      assert.deepStrictEqual(utils.packObject([1, "2", "abc", "def"]), {
        1: "2",
        abc: "def",
      });
    });
  });

  describe(".timeout", () => {
    it("should return a callback", (done) => {
      let invoked = false;
      const wrappedCallback1 = utils.timeout(() => {
        invoked = true;
      }, 0);
      wrappedCallback1();

      let invokedTimes = 0;
      const wrappedCallback2 = utils.timeout(function (err) {
        if (!err) 
          return;
        assert.strictEqual(err.message, "timeout");
        invokedTimes += 1;
        wrappedCallback2();
        setTimeout(() => {
          assert.strictEqual(invoked, true);
          assert.strictEqual(invokedTimes, 1);
        }, 0);
      }, 0);
    });
  });

  describe(".convertObjectToArray", () => {
    it("should return correctly", () => {
      const nullObject = Object.create(null);
      nullObject.abc = "def";
      assert.deepStrictEqual(utils.convertObjectToArray(nullObject), ["abc", "def"]);
      assert.deepStrictEqual(utils.convertObjectToArray({ 1: 2 }), ["1", 2]);
      assert.deepStrictEqual(utils.convertObjectToArray({ 1: "2" }), ["1", "2"]);
      assert.deepStrictEqual(utils.convertObjectToArray({ 1: "2", abc: "def" }), ["1", "2", "abc", "def"]);
    });
  });

  describe(".convertMapToArray", () => {
    it("should return correctly", () => {
      assert.deepStrictEqual(utils.convertMapToArray(new Map([["1", 2]])), ["1", 2]);
      assert.deepStrictEqual(utils.convertMapToArray(new Map([[1, 2]])), [1, 2]);
      assert.deepStrictEqual(
        utils.convertMapToArray(
          new Map<number | string, string>([
            [1, "2"],
            ["abc", "def"],
          ])
        ),
        [1, "2", "abc", "def"]
      );
    });
  });

  describe(".toArg", () => {
    it("should return correctly", () => {
      assert.strictEqual(utils.toArg(null), "");
      assert.strictEqual(utils.toArg(undefined), "");
      assert.strictEqual(utils.toArg("abc"), "abc");
      assert.strictEqual(utils.toArg(123), "123");
    });
  });

  describe(".optimizeErrorStack", () => {
    it("should return correctly", () => {
      const __dirname = fileURLToPath(new URL('.', import.meta.url));
      const error = new Error();
      const res = utils.optimizeErrorStack(
        error,
        new Error().stack + "\n@",
        __dirname
      );
      if (!res.stack) return;
      assert.strictEqual(res.stack.split("\n").pop(), "@");
    });
  });

  describe(".parseURL", () => {
    it("should return correctly", () => {
      assert.deepStrictEqual(utils.parseURL("/tmp.sock"), { path: "/tmp.sock" });
      assert.deepStrictEqual(utils.parseURL("127.0.0.1"), { host: "127.0.0.1" });
      assert.deepStrictEqual(utils.parseURL("6379"), { port: "6379" });
      assert.deepStrictEqual(utils.parseURL("127.0.0.1:6379"), {
          host: "127.0.0.1",
          port: "6379",
      });
      assert.deepStrictEqual(utils.parseURL("127.0.0.1:6379?db=2&key=value"), {
          host: "127.0.0.1",
          port: "6379",
          db: "2",
          key: "value",
      });
      assert.deepStrictEqual(utils.parseURL("redis://user:pass@127.0.0.1:6380/4?key=value"), {
          host: "127.0.0.1",
          port: "6380",
          db: "4",
          username: "user",
          password: "pass",
          key: "value",
      });
      assert.deepStrictEqual(utils.parseURL("redis://user:pass:word@127.0.0.1:6380/4?key=value"), {
          host: "127.0.0.1",
          port: "6380",
          db: "4",
          username: "user",
          password: "pass:word",
          key: "value",
      });
      assert.deepStrictEqual(utils.parseURL("redis://user@127.0.0.1:6380/4?key=value"), {
          host: "127.0.0.1",
          port: "6380",
          db: "4",
          username: "user",
          password: "",
          key: "value",
      });
      assert.deepStrictEqual(utils.parseURL("redis://127.0.0.1/"), {
          host: "127.0.0.1",
      });
      assert.deepStrictEqual(utils.parseURL("rediss://user:pass@127.0.0.1:6380/4?key=value"), {
          host: "127.0.0.1",
          port: "6380",
          db: "4",
          username: "user",
          password: "pass",
          key: "value",
      });
      assert.deepStrictEqual(utils.parseURL("redis://127.0.0.1/?family=6"), {
          host: "127.0.0.1",
          family: 6,
      });
      assert.deepStrictEqual(utils.parseURL("redis://127.0.0.1/?family=IPv6"), {
          host: "127.0.0.1",
          family: "IPv6",
      });
  });
  });

  describe(".resolveTLSProfile", () => {
    it("should leave options alone when no tls profile is set", () => {
      [
        { host: "localhost", port: 6379 },
        { host: "localhost", port: 6379, tls: true },
        { host: "localhost", port: 6379, tls: false },
        { host: "localhost", port: 6379, tls: "foo" },
        { host: "localhost", port: 6379, tls: {} },
        { host: "localhost", port: 6379, tls: { ca: "foo" } },
        { host: "localhost", port: 6379, tls: { profile: "foo" } },
      ].forEach((options) => {
        assert.deepStrictEqual(utils.resolveTLSProfile(options), options);
      });
    });

    it("should have redis.com profiles defined", () => {
      assert.ok(TLSProfiles.RedisCloudFixed);
      assert.ok(TLSProfiles.RedisCloudFlexible);
    });

    it("should read profile from options.tls.profile", () => {
      const input = {
        host: "localhost",
        port: 6379,
        tls: { profile: "RedisCloudFixed" },
      };
      const expected = {
        host: "localhost",
        port: 6379,
        tls: TLSProfiles.RedisCloudFixed,
      };

      assert.deepStrictEqual(utils.resolveTLSProfile(input), expected);
    });

    it("should read profile from options.tls", () => {
      const input = {
        host: "localhost",
        port: 6379,
        tls: "RedisCloudFixed",
      };
      const expected = {
        host: "localhost",
        port: 6379,
        tls: TLSProfiles.RedisCloudFixed,
      };

      assert.deepStrictEqual(utils.resolveTLSProfile(input), expected);
    });

    it("supports extra options when using options.tls.profile", () => {
      const input = {
        host: "localhost",
        port: 6379,
        tls: { profile: "RedisCloudFixed", key: "foo" },
      };
      const expected = {
        host: "localhost",
        port: 6379,
        tls: {
          ...TLSProfiles.RedisCloudFixed,
          key: "foo",
        },
      };

      assert.deepStrictEqual(utils.resolveTLSProfile(input), expected);
    });
  });

  describe(".sample", () => {
    it("should return a random value", () => {
      let stub = sinon.stub(Math, "random").callsFake(() => 0);
      assert.strictEqual(utils.sample([1, 2, 3]), 1);
      assert.strictEqual(utils.sample([1, 2, 3], 1), 2);
      assert.strictEqual(utils.sample([1, 2, 3], 2), 3);
      stub.restore();

      stub = sinon.stub(Math, "random").callsFake(() => 0.999999);
      assert.strictEqual(utils.sample([1, 2, 3]), 3);
      assert.strictEqual(utils.sample([1, 2, 3], 1), 3);
      assert.strictEqual(utils.sample([1, 2, 3], 2), 3);
      stub.restore();
    });
  });

  describe(".shuffle", () => {
    function compareArray(arr1, arr2) {
      if (arr1.length !== arr2.length) {
        return false;
      }
      arr1.sort();
      arr2.sort();
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }
      return true;
    }
    function testShuffle(arr) {
      const origin = arr.slice(0);
      assert.ok(compareArray(origin, utils.shuffle(arr)));
    }

    it("contains all items", () => {
      testShuffle([1]);
      testShuffle([1, 2]);
      testShuffle([2, 1]);
      testShuffle([1, 1, 1]);
      testShuffle([1, 2, 3]);
      testShuffle([3, -1, 0, 2, -1]);
      testShuffle(["a", "b", "d", "c"]);
      testShuffle(["c", "b"]);
    });

    it("mutates the original array", () => {
      const arr = [3, 7];
      const ret = utils.shuffle(arr);
      assert.strictEqual(arr === ret, true);
    });

    it("shuffles the array", () => {
      const arr = [1, 2, 3, 4];
      const copy = arr.slice(0);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        utils.shuffle(copy);
        for (let i = 0; i < copy.length; i++) {
          if (arr[i] !== copy[i]) {
            return;
          }
        }
      }
    });
  });
});
