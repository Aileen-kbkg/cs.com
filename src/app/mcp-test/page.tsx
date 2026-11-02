import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SliceZone from "@/components/SliceZone";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * Scratch page for testing the Prismic MCP connection: it renders the
 * `shared_section` document with the UID below and is kept out of search
 * results. shared_section already allows the slices the test uses, so the
 * page can be built through MCP without changing any type.
 */
const UID = "mcp-test";

async function getPage() {
	const client = createClient();

	return client.getByUID("shared_section", UID);
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	return {
		title: page?.data.meta_title || "MCP test - Cost Segregation",
		description: page?.data.meta_description || undefined,
		robots: { index: false, follow: false },
		openGraph: page?.data.meta_image?.url
			? { images: [{ url: page.data.meta_image.url }] }
			: undefined,
	};
}

export default async function Page() {
	const page = await getPage().catch(() => null);

	if (!page) {
		notFound();
	}

	return (
		<main>
			<SliceZone slices={page.data.slices} components={components} />
		</main>
	);
}
