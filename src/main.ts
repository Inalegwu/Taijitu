import { Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";
import { DoctorService } from "./doctor/service";
import { InterceptorService } from "./interceptor/service";
import { HttpServer } from "@effect/platform";

const MainLive = Layer.mergeAll(DoctorService, InterceptorService);

BunRuntime.runMain(Layer.launch(MainLive));
