import { HttpRouter, HttpServer } from "@effect/platform";
import { Effect } from "effect";

const router = HttpRouter.empty.pipe(
	HttpRouter.get(
		"*",
		Effect.sync(() => {
			throw new Error("TODO");
		}),
	),
);

const app = router.pipe(HttpServer.serve);

export default app;
