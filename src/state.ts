import { Effect, Ref } from "effect";
import config from "./config";

type ServerState = Array<
	Readonly<{
		address: string;
		inUse: boolean;
	}>
>;

export class Servers {
	update: (address: string, inUse: boolean) => Effect.Effect<void>;

	constructor(private value: Ref.Ref<ServerState>) {
		this.update = (addr: string, inUse: boolean) =>
			Ref.update(this.value, (a) => a);
	}
}

export const make = Effect.andThen(
	Effect.gen(function* () {
		const conf = yield* config;

		return yield* Ref.make(
			conf.servers.map((s) => ({
				address: s,
				inUse: false,
			})),
		);
	}),
	(servers) => new Servers(servers),
).pipe(
	Effect.annotateLogs({
		module: "state-resource",
	}),
);
