import { Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";
import { DoctorService } from "./doctor/service";
import { InterceptorService } from "./interceptor/service";

const MainLive = Layer.mergeAll(DoctorService, InterceptorService);

BunRuntime.runMain(Layer.launch(MainLive));
