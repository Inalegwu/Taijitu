import { Effect, Layer } from "effect";
import { Logger } from "./logger";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Log Reported");

  yield* Effect.acquireRelease(Effect.logInfo("Started Log Reporter"), () =>
    Effect.logInfo("Stopped Log Reporter"),
  );
});

export const LogService = Layer.scopedDiscard(make).pipe(
  Layer.provide(Logger.Live),
);
