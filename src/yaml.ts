import { Context, Data, Effect, Layer } from "effect";
import YAML from "js-yaml";

class YamlError extends Data.TaggedError("yaml-error")<{
  cause: unknown;
}> {}

type IYaml = Readonly<{
  parse: (content: string) => Effect.Effect<unknown, YamlError>;
}>;

const make = Effect.gen(function* () {
  const parse = (content: string) =>
    Effect.try({
      try: () => YAML.load(content),
      catch: (error) => new YamlError({ cause: error }),
    });

  return { parse } satisfies IYaml;
});

export class Yaml extends Context.Tag("yaml-client")<Yaml, IYaml>() {
  static live = Layer.effect(this, make);
}
