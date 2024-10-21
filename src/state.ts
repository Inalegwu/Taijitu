import { Effect, Ref, SynchronizedRef } from "effect";
import config from "./config";

type ServerState = Array<
	Readonly<{
		address: string;
		inUse: boolean;
		healthy: boolean;
	}>
>;

export class Servers {
	update: (address: string, inUse: boolean) => Effect.Effect<void>;
	get: Effect.Effect<ServerState>;

	constructor(private value: SynchronizedRef.SynchronizedRef<ServerState>) {
		this.update = (addr: string, inUse?: boolean, healthy?: boolean) =>
			SynchronizedRef.updateEffect(this.value, (a) =>
				// @ts-expect-error
				Effect.gen(function* () {}),
			);

		this.get = SynchronizedRef.get(this.value);
	}
}

export const make = Effect.andThen(
	Effect.gen(function* () {
		const conf = yield* config;

		return yield* SynchronizedRef.make(
			conf.servers.map((s) => ({
				address: s,
				inUse: false,
				healthy: true,
			})),
		);
	}),
	(servers) => new Servers(servers),
).pipe(
	Effect.annotateLogs({
		module: "state-resource",
	}),
);
