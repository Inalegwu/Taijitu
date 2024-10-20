import { Effect, Layer } from "effect";
import { Interceptor } from "./interceptor";
import { Health } from "./health";

const make = Effect.gen(function* () {
	yield* Effect.logInfo("Starting Taijitu");

	yield* Effect.acquireRelease(Effect.logInfo("Started Taijitu"), () =>
		Effect.logInfo("Taijitu Stopped"),
	);
}).pipe(
	Effect.annotateLogs({
		module: "balancer",
	}),
);

export const BalancerService = Layer.scopedDiscard(make).pipe(
	Layer.provide(Interceptor.Live),
	Layer.provide(Health.Live),
);
