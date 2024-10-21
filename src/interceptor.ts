import { Context, Effect, Layer } from "effect";
import * as Servers from "./state";

const make = Effect.gen(function* () {
	const serverState = yield* Servers.make;
	const servers = yield* serverState.get;

	// ensure we aren't getting any servers already
	// handling a transaction and any servers that
	// have been marked unhealthy by the health checker

	const listener = Effect.gen(function* () {
		yield* Effect.logInfo("Interceptor started");
	});

	yield* Effect.acquireRelease(Effect.fork(listener), () =>
		Effect.logInfo("Interceptor Stopped"),
	);
}).pipe(
	Effect.annotateLogs({
		module: "t-interceptor",
	}),
);

export class Interceptor extends Context.Tag("interceptor-service")<
	Interceptor,
	void
>() {
	static Live = Layer.effect(this, make);
}
