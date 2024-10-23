import { Effect, Layer } from "effect";
import { FetchHttpClient } from "@effect/platform";
import { ServerProxy } from "./proxy";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Interceptor Service");

  yield* Effect.acquireRelease(Effect.logInfo("Interceptor Started"), () =>
    Effect.logInfo("Interceptor Stopped"),
  );
});

export const InterceptorService = Layer.scopedDiscard(make).pipe(
  Layer.provide(ServerProxy.Live),
  Layer.provide(FetchHttpClient.layer),
);
