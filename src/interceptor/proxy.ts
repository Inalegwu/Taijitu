import { Effect, Layer } from "effect";

const make = Effect.gen(function* () {
  const fiber = Effect.fork(
    Effect.gen(function* () {
      yield* Effect.log("here");
    }),
  );

  yield* Effect.acquireRelease(fiber, (fiber) =>
    fiber
      .interruptAsFork(fiber.id())
      .pipe(Effect.tap(Effect.logInfo("Intercetor Proxy Stopped"))),
  );
});

export const ServerProxy = {
  Live: Layer.scopedDiscard(make),
};
