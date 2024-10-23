import { Context, Effect, Layer, SynchronizedRef } from "effect";
import config from "./config";

type Server = {
  address: string;
  inUse: boolean;
  healthy: boolean;
};
type ServerState = Map<string, Server>;

class Servers {
  update: (
    address: string,
    inUse?: boolean,
    health?: boolean,
  ) => Effect.Effect<void>;
  get: Effect.Effect<ServerState>;

  constructor(private value: SynchronizedRef.SynchronizedRef<ServerState>) {
    this.update = (addr: string, inUse?: boolean, healthy?: boolean) =>
      SynchronizedRef.update(this.value, (servers) => {
        const exists = servers.has(addr);

        if (!exists) {
          return servers;
        }

        servers.delete(addr);

        servers.set(addr, {
          address: addr,
          inUse: inUse || false,
          healthy: healthy || true,
        });

        return servers;
      });

    this.get = SynchronizedRef.get(this.value);
  }
}

const makeState = Effect.andThen(
  Effect.gen(function* () {
    const conf = yield* config;

    // conf.servers.map((s) => ({
    // 				address: s,
    // 				inUse: false,
    // 				healthy: true,
    // 			})),
    return yield* SynchronizedRef.make(
      new Map<string, Server>(
        conf.servers.map((server) => [
          server,
          {
            address: server,
            inUse: false,
            healthy: true,
          } satisfies Server,
        ]),
      ),
    );
  }),
  (servers) => new Servers(servers),
).pipe(
  Effect.annotateLogs({
    module: "t-state",
  }),
);

type IState = Readonly<{
  update: (
    address: string,
    inUse?: boolean,
    health?: boolean,
  ) => Effect.Effect<void>;
  get: Effect.Effect<ServerState>;
}>;

const make = Effect.gen(function* () {
  const state = yield* makeState;

  return {
    update: state.update,
    get: state.get,
  } satisfies IState;
});

export class State extends Context.Tag("state-resourrce")<State, IState>() {
  static live = Layer.effect(this, make);
}
