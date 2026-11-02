import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ImageField } from "@prismicio/client";
import SliceZone from "@/components/SliceZone";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * Scratch page for testing the Prismic MCP connection: it renders the
 * `test` singleton's slices and is kept out of search results.
 *
 * The generated types still type this slice zone as empty; remove the
 * cast after "Pull to local".
 */
type TestDocument = {
	data: {
		slices: never[];
		meta_title: string | null;
		meta_description: string | null;
		meta_image: ImageField;
	};
};

async function getPage() {
	const client = createClient();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (client as any).getSingle("test") as Promise<TestDocument>;
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
