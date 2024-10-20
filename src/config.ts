import { Config } from "effect";

class TaijituConfig {
	constructor(readonly servers: string[]) {}
}

const config = Config.map(
	Config.array(Config.string(), "servers"),
	(servers) => new TaijituConfig(servers),
);

export default config;
