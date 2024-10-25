import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { Context, Effect, Layer } from "effect";
import { Config } from "../config";
import { BunHttpServer } from "@effect/platform-bun";

const make = Effect.gen(function* () {
  const config = yield* Config;

  const router = HttpRouter.empty.pipe(
    HttpRouter.all(
      "*",
      Effect.gen(function* () {
        return yield* HttpServerResponse.json({});
      }),
      {
        uninterruptible: true,
      },
    ),
  );

  const server = yield* BunHttpServer.make({
    port: config.port || 8081,
    reusePort: true,
  });
}).pipe(
  Effect.annotateLogs({
    service: "proxy-service",
  }),
);

export class ProxyService extends Context.Tag("proxy-service")<
  ProxyService,
  void
>() {
  static live = Layer.effect(this, make).pipe(Layer.provide(Config.live));
}
