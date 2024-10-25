import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Context, Effect, Layer } from "effect";
import { Config } from "../config";

const router = HttpRouter.empty.pipe(
  HttpRouter.all(
    "*",
    Effect.gen(function* () {
      // todo use state here...
      return yield* HttpServerResponse.json({});
    }),
    {
      uninterruptible: true,
    },
  ),
);

const App = router.pipe(
  Effect.annotateLogs({
    service: "proxy-service",
  }),
  HttpServer.serve,
);

class Live extends Context.Tag("proxy-server")<Live, void>() {
  static live = Layer.effect(
    this,
    Effect.gen(function* () {
      const config = yield* Config;

      return yield* BunHttpServer.make({
        port: config.port || 8081,
      });
    }),
  ).pipe(Layer.provide(Config.live));
}

export const Server = {
  live: Layer.provide(App, Live.live),
};
