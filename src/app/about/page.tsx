import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * The `about` custom type is not yet in the generated Prismic types.
 * Remove this once prismicio-types.d.ts has been regenerated.
 */
type SeoMetadata = {
	meta_title: string | null;
	meta_description: unknown;
	meta_image: { url: string | null } | null;
};

async function getAbout() {
	const client = createClient();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (client as any).getSingle("about") as Promise<{
		data: {
			slices: never[];
			seo_metadata: SeoMetadata[];
		};
	}>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getAbout().catch(() => null);

	if (!page) {
		return { title: "About" };
	}

	const seo = page.data.seo_metadata?.[0];

	const title = seo?.meta_title || "About - Cost Segregation";
	const description = seo?.meta_description
		? asText(seo.meta_description as never)
		: undefined;
	const image = seo?.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: {
			canonical: "/about",
		},
		openGraph: {
			type: "article",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const page = await getAbout().catch(() => null);

	if (!page) {
		notFound();
	}

	return <SliceZone slices={page.data.slices} components={components} />;
}