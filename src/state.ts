import { Context, type Ref } from "effect";

type Server = {
  address: string;
  inUse: boolean;
  health: boolean;
};

export class ServerState extends Context.Tag("server-state")<
  ServerState,
  Ref.Ref<Set<Server>>
>() {}
