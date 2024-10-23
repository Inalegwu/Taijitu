import { Effect, Layer, Schema } from "effect";
import { Config } from "../config";
import { HttpClient } from "@effect/platform";

const HealthSchema = Schema.Struct({
  alive: Schema.Number,
});

const make = Effect.gen(function* () {
  const config = yield* Config;

  const fiber = Effect.forkDaemon(
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      yield* Effect.forEach(config.servers, (server) =>
        Effect.gen(function* () {
          yield* Effect.void;
        }),
      );
    }),
  );

  yield* Effect.acquireRelease(fiber, (fiber) =>
    fiber
      .interruptAsFork(fiber.id())
      .pipe(Effect.tap(Effect.logInfo("Stopped Doctor Check"))),
  );
}).pipe(
  Effect.annotateLogs({
    service: "check",
  }),
);

export const Check = {
  Live: Layer.scopedDiscard(make).pipe(Layer.provide(Config.live)),
};

// const response = yield* client.get(`${server}/health`);

// const result = yield* response.json;

// const health = yield* Schema.decodeUnknown(HealthSchema)(result, {
//   onExcessProperty: "ignore",
// });

// if (health.alive === 1) {
//   yield* Effect.logInfo(`${server} is still alive`);
// } else {
//   yield* Effect.logError(`${server} is dead`);
// }
