
import * as prismic from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import type { CreateClientConfig } from "@prismicio/next";

export const repositoryName = "costsegregationcom";

export function createClient(config: CreateClientConfig = {}) {
	const { fetchOptions, ...clientConfig } = config;

	const client = prismic.createClient(repositoryName, {
		...clientConfig,
		fetchOptions: {
			...fetchOptions,
			cache: "force-cache",
			next: {
				...fetchOptions?.next,
				tags: [
					...(fetchOptions?.next?.tags ?? []),
					"prismic",
				],
			},
		},
	});

	enableAutoPreviews({
		client,
		...config,
	});

	return client;
}
