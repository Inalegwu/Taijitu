import { Effect, Layer } from "effect";
import { Check } from "./check";
import { FetchHttpClient } from "@effect/platform";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Doctor Service");

  yield* Effect.acquireRelease(Effect.logInfo("Doctor Started"), () =>
    Effect.logInfo("Doctor Stopped"),
  );
});

export const DoctorService = Layer.scopedDiscard(make).pipe(
  Layer.provide(Check.Live),
  Layer.provide(FetchHttpClient.layer),
);
