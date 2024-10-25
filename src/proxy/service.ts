import { Effect, Layer } from "effect";
import { Config } from "../config";
import { Server } from "./server";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Proxy");

  yield* Effect.acquireRelease(Effect.logInfo("Proxy Started"), () =>
    Effect.logInfo("Proxy Stopped"),
  );
});

export const ProxyService = Layer.scopedDiscard(make).pipe(
  Layer.provide(Config.live),
  Layer.provide(Server.live),
);
