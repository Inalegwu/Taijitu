import { Context, Effect, SynchronizedRef } from "effect";
import { Config } from "./config";

type Server = {
  server: string;
  inUse: boolean;
  isHealthy: boolean;
};

type ServerState = Array<Server>;

class State {
  get: Effect.Effect<void>;

  constructor(private value: SynchronizedRef.SynchronizedRef<ServerState>) {
    this.get = SynchronizedRef.get(this.value);
  }
}

export const make = Effect.andThen(
  Effect.gen(function* () {
    const config = yield* Config;

    return yield* SynchronizedRef.make(
      config.servers.map(
        (server) =>
          ({
            server,
            inUse: false,
            isHealthy: true,
          }) satisfies Server,
      ),
    );
  }),
  (v) => new State(v),
);
