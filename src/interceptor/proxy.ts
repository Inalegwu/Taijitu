import {
  HttpClient,
  HttpRouter,
  HttpServer,
  HttpServerResponse,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Context, Effect, Layer } from "effect";
import { Config } from "../config";

// all interceptions happen here
const router = HttpRouter.empty.pipe(
  HttpRouter.all(
    "*",
    Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      return yield* HttpServerResponse.json({});
    }),
    {
      uninterruptible: true,
    },
  ),
);

const App = router.pipe(
  Effect.annotateLogs({
    service: "interceptor-server",
  }),
  HttpServer.serve,
  HttpServer.withLogAddress,
);

type IServer = typeof BunHttpServer.make;

const make = Effect.gen(function* () {
  const config = yield* Config;

  return yield* BunHttpServer.make({
    port: config.port || 8080,
    reusePort: true,
  });
});

class Server extends Context.Tag("server")<Server, IServer>() {
  static live = Layer.scopedDiscard(make).pipe(Layer.provide(Config.live));
}

export const ServerProxy = Layer.provide(App, Server.live);
