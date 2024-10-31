import { Effect, Layer } from "effect";

const make = Effect.gen(function* () {
  const fiber = Effect.forkDaemon(Effect.gen(function* () {}));

  yield* Effect.acquireRelease(fiber, (fiber) =>
    fiber.interruptAsFork(fiber.id()),
  );
});

export const Logger = {
  Live: Layer.scopedDiscard(make),
};
