import { Context, Effect, Layer } from "effect";
import * as Servers from "./state";

const make = Effect.gen(function* () {
	const serverState = yield* Servers.make;
	const servers = yield* serverState.get;

	// ensure we aren't getting any servers already
	// handling a transaction and any servers that
	// have been marked unhealthy by the health checker
	const usableServers = servers.filter(
		(v) => v.healthy === true && v.inUse !== true,
	);

	const listener = Effect.gen(function* () {
		yield* Effect.logInfo("Interceptor started");
	});

	yield* Effect.fork(listener);
}).pipe(
	Effect.annotateLogs({
		module: "interceptor",
	}),
);

export class Interceptor extends Context.Tag("interceptor-service")<
	Interceptor,
	void
>() {
	static Live = Layer.effect(this, make);
}
