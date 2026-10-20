import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ImageField } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * The `for_tax_advisors` type is not yet in the generated Prismic types.
 * Remove this block and the cast after "Pull to local".
 */
type ForTaxAdvisorsDocument = {
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
		"for_tax_advisors",
	) as Promise<ForTaxAdvisorsDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title = page?.data.meta_title || "For Tax Advisors - Cost Segregation";
	const description =
		page?.data.meta_description ||
		"CPAs - maximize your cost segregation savings using this free-to-use cost segregation software";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/for-tax-advisors" },
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