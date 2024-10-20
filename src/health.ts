import { Context, Duration, Effect, Layer, Schedule } from "effect";
import * as Servers from "./state";

const make = Effect.gen(function* () {
	yield* Effect.logInfo("Starting Health Check Service");

	const servers = yield* Servers.make;
	const health = Effect.repeat(
		Effect.gen(function* () {
			yield* Effect.logInfo("health check");
		}),
		Schedule.exponential(Duration.millis(500)),
	);

	yield* Effect.acquireRelease(
		Effect.andThen(Effect.logInfo("HealthCheck Service Started"), health),
		() => Effect.logInfo("Stopped Health Check Service"),
	);
});

export class Health extends Context.Tag("healthcheck-service")<Health, void>() {
	static Live = Layer.effect(this, make);
}
