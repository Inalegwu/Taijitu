import { Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";
import { DoctorService } from "./doctor/service";
import { ProxyService } from "./proxy/service";
import { LogService } from "./log/service";

const MainLive = Layer.mergeAll(DoctorService, ProxyService, LogService);

BunRuntime.runMain(Layer.launch(MainLive));
