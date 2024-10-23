import { Context, Effect, Layer } from "effect";
import { State } from "./state";
import config from "./config";

const make = Effect.gen(function* () {
  const serverState = yield* State;
  const servers = yield* serverState.get;

  const listener = Effect.gen(function* () {
    const { algorithm } = yield* config;

    yield* Effect.logInfo("Interceptor started");
  });

  yield* Effect.acquireRelease(Effect.fork(listener), () =>
    Effect.logInfo("Interceptor Stopped"),
  );
}).pipe(
  Effect.annotateLogs({
    module: "t-interceptor",
  }),
);

export class Interceptor extends Context.Tag("interceptor-service")<
  Interceptor,
  void
>() {
  static Live = Layer.effect(this, make);
}
