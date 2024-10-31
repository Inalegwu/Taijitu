import { Effect, Layer } from "effect";
import { Check } from "./check";
import { FetchHttpClient } from "@effect/platform";

/**
 *
 * The overall Doctor service
 * all subservices are maintained,acquired
 * and released from this service and is the
 * only interface exposed outwardly
 * all subservices are 'provided' to here
 *
 */
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
