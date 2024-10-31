import { Duration, Effect, Layer, Schedule, Schema } from "effect";
import { Config } from "../config";
import { HttpClient } from "@effect/platform";

/**
 *
 * the expected response from
 * the default health check route
 * all servers intended to be proxied
 * through taijitu are expected to implement
 * to ensure they are alive
 *
 */
const _HealthSchema = Schema.Struct({
  alive: Schema.Number,
});

/**
 *
 * Create the Health Check Service
 *
 */
const make = Effect.gen(function* () {
  const config = yield* Config;

  // Forks this fiber into the global scope
  // to ensure that this scope closing won't
  // prevent health checks from being carried
  // out
  const fiber = Effect.forkDaemon(
    Effect.repeat(
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;

        yield* Effect.forEach(config.servers, (server) =>
          Effect.gen(function* () {
            yield* Effect.void;
          }),
        );
      }),
      Schedule.duration(Duration.millis(1000)),
    ),
  );

  // Spawn and subsequently shutdown the health check
  // fiber when the program is winding down
  yield* Effect.acquireRelease(fiber, (fiber) =>
    fiber
      .interruptAsFork(fiber.id())
      .pipe(Effect.tap(Effect.logInfo("Stopped Doctor Check"))),
  );
});

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
