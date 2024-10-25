import { Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";
import { DoctorService } from "./doctor/service";
import { ProxyService } from "./proxy/service";

const MainLive = Layer.mergeAll(DoctorService, ProxyService);

BunRuntime.runMain(Layer.launch(MainLive));
