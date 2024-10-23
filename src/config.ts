import { Data, Effect } from "effect";
import { YAMLClient } from "./clients/yaml";
import { Schema } from "effect";

const ConfigSchema = Schema.Struct({
  servers: Schema.Array(Schema.String).annotations({
    identifier: "SERVERS",
    message: () => "Error loading SERVERS from config",
  }),
  host: Schema.String.annotations({
    identifier: "HOST",
    message: () => "Error Loading HOST from config",
  }),
  port: Schema.Number.annotations({
    identifier: "PORT",
    message: () => "Error loading PORT from config",
  }),
  algorithm: Schema.Literal(
    "round-robin",
    "weighted-round-robin",
    "url-hash",
  ).pipe(Schema.optional),
}).annotations({
  identifier: "config",
  message: () =>
    "Error loading config, Certain fields appear to be invalid or missing",
});

class ConfigError extends Data.TaggedError("config-error")<{
  cause: unknown;
}> {}

const acquire = Effect.gen(function* () {
  const yaml = yield* YAMLClient;

  const file = yield* Effect.tryPromise({
    try: () => Bun.file("./config.yaml").text(),
    catch: (error) => new ConfigError({ cause: error }),
  });

  const parsed = yield* yaml.parse(file);

  const result = yield* Schema.decodeUnknown(ConfigSchema)(parsed, {
    onExcessProperty: "ignore",
  });

  return result;
}).pipe(
  Effect.annotateLogs({
    module: "t-config",
  }),
);

const config = Effect.acquireRelease(acquire, () => Effect.void).pipe(
  Effect.provide(YAMLClient.live),
);

export default config;
