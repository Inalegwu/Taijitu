import { Data, Effect } from "effect";
import { YAMLClient } from "./clients/yaml";
import { Schema } from "@effect/schema";

const ConfigSchema = Schema.Struct({
	servers: Schema.Array(Schema.String),
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

	return {
		servers: result.servers,
	};
}).pipe(
	Effect.annotateLogs({
		module: "t-config",
	}),
);

const config = Effect.acquireRelease(acquire, () => Effect.void).pipe(
	Effect.provide(YAMLClient.live),
);

export default config;
