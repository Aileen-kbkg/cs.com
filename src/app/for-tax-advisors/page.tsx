import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ImageField, KeyTextField, RichTextField } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import FaqList from "@/components/FaqList";

import styles from "./ForTaxAdvisors.module.css";

/**
 * The `for_tax_advisors` page type is not yet in the generated Prismic
 * types. Remove this block and the cast after "Pull to local".
 */
type FaqItem = {
	question: KeyTextField;
	answer: RichTextField;
};

type Slice = { slice_type: string };

type ForTaxAdvisorsDocument = {
	data: {
		slices: Slice[];
		faq: FaqItem[];
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

	const faq = page.data.faq ?? [];
	const slices = page.data.slices ?? [];

	/**
	 * The live page runs ... product cards → FAQs → closing CTA, but the
	 * FAQs live in a document field rather than the slice zone. Splitting
	 * the zone around the CTA keeps that order.
	 */
	const mainSlices = slices.filter(
		(slice) => slice.slice_type !== "cta_banner",
	);
	const ctaSlices = slices.filter(
		(slice) => slice.slice_type === "cta_banner",
	);

	return (
		// The wrapper scopes this page's slice overrides, so the same
		// slices keep their own styling everywhere else.
		<main className={styles.page}>
			<SliceZone
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				slices={mainSlices as any}
				components={components}
				// The live feature cards show their full text, with no
				// "Learn More" detail view.
				context={{ fullCardText: true }}
			/>

			<FaqList items={faq} title="Frequently Asked Questions" />

			{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
			<SliceZone slices={ctaSlices as any} components={components} />
		</main>
	);
}