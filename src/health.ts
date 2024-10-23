import { Context, Duration, Effect, Layer, Schedule, Data } from "effect";
import { State } from "./state";
import { FetchHttpClient, HttpClient } from "@effect/platform";

class HealthCheckError extends Data.TaggedError("doctor-error")<{
  cause: unknown;
}> {}

const make = Effect.gen(function* () {
  const serverState = yield* State;
  const servers = yield* serverState.get;

  const health = Effect.repeat(
    Effect.gen(function* () {
      yield* Effect.logInfo("Running Doctor");
      const address = servers.entries().map((server) => server[1].address);
      const httpClient = yield* HttpClient.HttpClient;

      yield* Effect.forEach(
        address,
        (address) =>
          Effect.gen(function* () {
            yield* Effect.try({
              try: () => {
                httpClient.get(`${address}/health`).pipe(
                  Effect.andThen((response) =>
                    Effect.gen(function* () {
                      const res = yield* response.json;

                      const result = res as {
                        alive: number;
                      };

                      if (result.alive === 1) {
                        serverState.update(address, undefined, true);
                        return;
                      }

                      serverState.update(address, undefined, false);
                    }),
                  ),
                );
              },
              catch: (error) => new HealthCheckError({ cause: error }),
            });
          }),
        {
          concurrency: "unbounded",
        },
      );
    }),
    Schedule.exponential(Duration.seconds(5), 2),
  );

  yield* Effect.fork(health);
}).pipe(
  Effect.provide(FetchHttpClient.layer),
  Effect.annotateLogs({
    module: "t-doctor",
  }),
);

export class Doctor extends Context.Tag("doctor-service")<Doctor, void>() {
  static Live = Layer.effect(this, make);
}
