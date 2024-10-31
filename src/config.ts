import { Context, Data, Effect, Layer, Schema } from "effect";
import { Yaml } from "./yaml";

class ConfigError extends Data.TaggedError("config-error")<{
  cause: unknown;
}> {}

const ConfigSchema = Schema.Struct({
  servers: Schema.Array(Schema.String),
  host: Schema.String.pipe(Schema.optional),
  port: Schema.Number.pipe(Schema.optional),
  algorithm: Schema.Literal(
    "round-robin",
    "sticky-round-robin",
    "weighted-round-robin",
    "ip-url-hash",
    "least-connections",
    "least-time",
  ),
});

type IConfig = Readonly<typeof ConfigSchema.Type>;

const make = Effect.gen(function* () {
  const yaml = yield* Yaml;

  const file = yield* Effect.tryPromise({
    try: () => Bun.file("./config.yaml").text(),
    catch: (error) => new ConfigError({ cause: error }),
  });

  const result = yield* yaml.load(file);

  const parsed = yield* Schema.decodeUnknown(ConfigSchema)(result, {
    onExcessProperty: "ignore",
  });

  return parsed satisfies IConfig;
}).pipe(
  Effect.annotateLogs({
    resource: "config-resource",
  }),
);

export class Config extends Context.Tag("config-resource")<Config, IConfig>() {
  static live = Layer.effect(this, make).pipe(Layer.provide(Yaml.live));
}
