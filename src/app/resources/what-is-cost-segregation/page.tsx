import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ImageField } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * The `what_is_cost_segregation` page type is not yet in the generated
 * Prismic types. Remove this block and the cast after "Pull to local".
 */
type WhatIsCostSegregationDocument = {
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
	return (client as any).getSingle(
		"what_is_cost_segregation",
	) as Promise<WhatIsCostSegregationDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title =
		page?.data.meta_title || "What is Cost Segregation? - Cost Segregation";
	const description =
		page?.data.meta_description ||
		"Cost segregation is a tax strategy that identifies parts of an investment property that may be depreciated over shorter periods.";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/resources/what-is-cost-segregation" },
		openGraph: {
			type: "article",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const page = await getPage().catch(() => null);

	if (!page) {
		notFound();
	}

	return <SliceZone slices={page.data.slices} components={components} />;
}