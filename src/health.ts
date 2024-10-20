import { Context, Duration, Effect, Layer, Schedule, Data } from "effect";
import * as Servers from "./state";
import { HttpClient } from "@effect/platform";

class HealthCheckError extends Data.TaggedError("health-check-error")<{
	cause: unknown;
}> {}

const make = Effect.gen(function* () {
	yield* Effect.logInfo("Starting Health Check Service");

	const serverState = yield* Servers.make;
	const servers = yield* serverState.get;

	const health = Effect.repeat(
		Effect.gen(function* () {
			const address = servers.map((server) => server.address);
			const httpClient = yield* HttpClient.HttpClient;

			yield* Effect.forEach(
				address,
				(address) =>
					Effect.gen(function* () {
						yield* Effect.try({
							try: () => httpClient.get(`${address}/health`),
							catch: (error) => new HealthCheckError({ cause: error }),
						});
					}),
				{
					concurrency: "unbounded",
				},
			);
		}),
		Schedule.exponential(Duration.millis(500)),
	);

	yield* Effect.acquireRelease(
		Effect.andThen(
			Effect.logInfo("HealthCheck Service Started"),
			Effect.forkDaemon(health),
		),
		() => Effect.logInfo("Stopped Health Check Service"),
	);
}).pipe(
	Effect.annotateLogs({
		module: "health-check",
	}),
);

export class Health extends Context.Tag("healthcheck-service")<Health, void>() {
	static Live = Layer.effect(this, make);
}
