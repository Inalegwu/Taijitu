import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect, Layer } from "effect";

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
  HttpServer.serve(),
);

const Live = BunHttpServer.layer({
  port: 8081,
}).pipe();

export const Server = {
  Live: Layer.provide(App, Live),
};
