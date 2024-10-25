import { Layer } from "effect";
import { BunRuntime } from "@effect/platform-bun";
import { DoctorService } from "./doctor/service";

const MainLive = Layer.mergeAll(DoctorService);

BunRuntime.runMain(Layer.launch(MainLive));
