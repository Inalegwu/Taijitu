import {
  HttpClient,
  HttpRouter,
  HttpServer,
  HttpServerResponse,
} from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { Config } from "../config";
import { ServerState } from "../state";

const router = HttpRouter.empty.pipe(
  HttpRouter.all(
    "*",
    Effect.gen(function* () {
      // todo use state here...
      return yield* HttpServerResponse.json({
        hello: "world",
      });
    }),
  ),
);

const App = router.pipe(
  Effect.annotateLogs({
    service: "proxy-service",
  }),
  HttpServer.serve(),
);

const Live = Layer.unwrapEffect(
  Effect.gen(function* () {
    const config = yield* Config;

    yield* Effect.logInfo(
      `Starting server on port '${config.port}' and host '${config.host}'`,
    );

    return BunHttpServer.layer({
      port: config.port || 8081,
      hostname: config.host || "localhost",
    });
  }),
).pipe(Layer.provide(Config.live));

export const Server = {
  Live: Layer.provide(App, Live),
};
