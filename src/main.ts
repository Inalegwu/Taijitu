import { Layer } from "effect";
import { BalancerService } from "./balancer";
import { BunRuntime } from "@effect/platform-bun";

const MainLive = Layer.mergeAll(BalancerService);

BunRuntime.runMain(Layer.launch(MainLive));
