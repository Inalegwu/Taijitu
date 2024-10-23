import {
  HttpApiBuilder,
  HttpClient,
  HttpRouter,
  HttpServer,
  HttpServerResponse,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Context, Effect, Layer } from "effect";
import { Config } from "../config";

const make = Effect.gen(function* () {
  yield* Effect.logInfo("Starting server proxy");
  const config = yield* Config;

  const server = yield* BunHttpServer.make({
    port: config.port || 8080,
  });

  const serverProxy = Effect.fork(
    // biome-ignore lint/correctness/useYield: <explanation>
    Effect.gen(function* () {
      const router = HttpRouter.empty
        .pipe(
          HttpRouter.all(
            "*",
            Effect.gen(function* () {
              return yield* HttpServerResponse.json({});
            }),
            {
              uninterruptible: true,
            },
          ),
        )
        .pipe(
          Effect.annotateLogs({
            service: "interceptor-server",
          }),
          HttpServer.serve,
          HttpServer.withLogAddress,
        );

      // server.serve(router)
    }),
  );

  yield* Effect.acquireRelease(
    serverProxy.pipe(Effect.tap(Effect.logInfo("Started Proxy"))),
    (fiber) =>
      fiber
        .interruptAsFork(fiber.id())
        .pipe(Effect.tap(Effect.logInfo("Stopped Proxy"))),
  );
});

export const ServerProxy = {
  Live: Layer.scopedDiscard(make).pipe(Layer.provide(Config.live)),
};
