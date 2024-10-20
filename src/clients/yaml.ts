import { Context, Data, Layer } from "effect";
import { Effect } from "effect";
import YAML from "js-yaml";

class YamlError extends Data.TaggedError("yaml-error")<{
	cause: unknown;
}> {}

type IYamlClient = Readonly<{
	parse: (content: string) => Effect.Effect<any, YamlError>;
}>;

const make = Effect.gen(function* () {
	const parse = (content: string) =>
		Effect.try({
			try: () => YAML.load(content),
			catch: (error) => new YamlError({ cause: error }),
		});

	return {
		parse,
	} satisfies IYamlClient;
});

export class YAMLClient extends Context.Tag("yaml-client")<
	YAMLClient,
	IYamlClient
>() {
	static live = Layer.effect(this, make);
}
