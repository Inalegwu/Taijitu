import { Context, type SynchronizedRef } from "effect";

type ServerState = Array<{
  server: string;
  isHealthy: boolean;
  inUse: boolean;
}>;

export class State extends Context.Tag("state-resource")<
  State,
  SynchronizedRef.SynchronizedRef<ServerState>
>() {}
