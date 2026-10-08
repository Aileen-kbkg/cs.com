// prismicio.ts — no slicemachine.config.json needed
import * as prismic from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import type { CreateClientConfig } from "@prismicio/next";

export function createClient(config: CreateClientConfig = {}) {
	const client = prismic.createClient("cost-segregation", config);
	enableAutoPreviews({ client, ...config });
	return client;
}