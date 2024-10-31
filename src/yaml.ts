import { Context, Data, Effect, Layer } from "effect";
import YAML from "js-yaml";

class YamlError extends Data.TaggedError("yaml-error")<{
  cause: unknown;
}> {}

type IYaml = Readonly<{
  load: (content: string) => Effect.Effect<unknown, YamlError>;
  // biome-ignore lint/suspicious/noExplicitAny: needed for yaml
  dump: (content: any) => Effect.Effect<string, YamlError>;
}>;

const make = Effect.gen(function* () {
  const load = (content: string) =>
    Effect.try({
      try: () => YAML.load(content),
      catch: (error) => new YamlError({ cause: error }),
    });

  // biome-ignore lint/suspicious/noExplicitAny: required for YAML
  const dump = (yaml: any) =>
    Effect.try({
      try: () => YAML.dump(yaml),
      catch: (error) => new YamlError({ cause: error }),
    });

  return { load, dump } satisfies IYaml;
});

export class Yaml extends Context.Tag("yaml-client")<Yaml, IYaml>() {
  static live = Layer.effect(this, make);
}
