import { Context, Duration, Effect, Layer, Schedule, Data } from "effect";
import * as Servers from "./state";
import { HttpClient } from "@effect/platform";

class HealthCheckError extends Data.TaggedError("doctor-error")<{
	cause: unknown;
}> {}

const make = Effect.gen(function* () {
	yield* Effect.logInfo("Starting Doctor");

	const serverState = yield* Servers.make;
	const servers = yield* serverState.get;

	const health = Effect.repeat(
		Effect.gen(function* () {
			const address = servers.entries().map((server) => server[1].address);
			const httpClient = yield* HttpClient.HttpClient;

			yield* Effect.forEach(
				address,
				(address) =>
					Effect.gen(function* () {
						yield* Effect.try({
							try: () => {
								httpClient.get(`${address}/health`).pipe(
									Effect.andThen((res) =>
										Effect.gen(function* () {
											const response = yield* res.json;

											const result = response as {
												alive: number;
											};

											if (result.alive === 1) {
												serverState.update(address, undefined, true);
												return;
											}

											serverState.update(address, undefined, false);
										}),
									),
								);
							},
							catch: (error) => new HealthCheckError({ cause: error }),
						});
					}),
				{
					concurrency: "unbounded",
				},
			);
		}),
		Schedule.fixed(Duration.seconds(5)),
	);

	yield* Effect.acquireRelease(
		Effect.andThen(Effect.logInfo("Doctor Started"), Effect.forkDaemon(health)),
		(fiber) => fiber.interruptAsFork(fiber.id()),
	);
}).pipe(
	Effect.annotateLogs({
		module: "health-check",
	}),
);

export class Health extends Context.Tag("doctor-service")<Health, void>() {
	static Live = Layer.effect(this, make);
}
