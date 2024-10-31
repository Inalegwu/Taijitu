import { Effect, Layer } from "effect";
import { Server } from "./server";

/**
 *
 * The overall Proxy service
 * all subservices are maintained,acquired
 * and released from this service and is the
 * only interface exposed outwardly
 * all subservices are 'provided' to here
 *
 */
const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Proxy");

  yield* Effect.acquireRelease(Effect.logInfo("Proxy Started"), () =>
    Effect.logInfo("Proxy Stopped"),
  );
});

export const ProxyService = Layer.scopedDiscard(make).pipe(
  Layer.provide(Server.Live),
);
