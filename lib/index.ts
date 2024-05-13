exports = module.exports = require("./Redis.ts").default;

export { default } from "./Redis.ts";
export { default as Redis } from "./Redis.ts";
export { default as Cluster } from "./cluster/index.ts";

/**
 * @ignore
 */
export { default as Command } from "./Command.ts";

/**
 * @ignore
 */
export {
  default as RedisCommander,
  Result,
  ClientContext,
} from "./utils/RedisCommander.ts";

/**
 * @ignore
 */
export { default as ScanStream } from "./ScanStream.ts";

/**
 * @ignore
 */
export { default as Pipeline } from "./Pipeline.ts";

/**
 * @ignore
 */
export { default as AbstractConnector } from "./connectors/AbstractConnector.ts";

/**
 * @ignore
 */
export {
  default as SentinelConnector,
  SentinelIterator,
} from "./connectors/SentinelConnector/index.ts";

/**
 * @ignore
 */
export type { Callback } from "./types.ts";

export type {
  SentinelAddress,
  SentinelConnectionOptions,
} from "./connectors/SentinelConnector";
export type { StandaloneConnectionOptions } from "./connectors/StandaloneConnector.ts";
export type { RedisOptions, CommonRedisOptions } from "./redis/RedisOptions.ts";
export type { ClusterNode } from "./cluster/index.ts";
export type {
  ClusterOptions,
  DNSLookupFunction,
  DNSResolveSrvFunction,
  NatMap,
} from "./cluster/ClusterOptions";
export type { NodeRole } from "./cluster/util.ts";
export type {
  RedisKey,
  RedisValue,
  ChainableCommander,
} from "./utils/RedisCommander.ts";

// No TS typings
export const ReplyError = require("redis-errors").ReplyError;

/**
 * @ignore
 */
Object.defineProperty(exports, "Promise", {
  get() {
    console.warn(
      "ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used."
    );
    return Promise;
  },
  set(_lib: unknown) {
    console.warn(
      "ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used."
    );
  },
});

/**
 * @ignore
 */
export function print(err: Error | null, reply?: any) {
  if (err) {
    console.log("Error: " + err);
  } else {
    console.log("Reply: " + reply);
  }
}
