
import * as prismic from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import type { CreateClientConfig } from "@prismicio/next";

export const repositoryName = "cost-segregation";

export function createClient(config: CreateClientConfig = {}) {
	const client = prismic.createClient(repositoryName, config);

	enableAutoPreviews({ client, ...config });

	return client;
}

