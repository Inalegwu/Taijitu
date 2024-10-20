import { Context, Effect, Layer } from "effect";

// type IInterceptor = Readonly<{}>;

const make = Effect.gen(function* () {
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
