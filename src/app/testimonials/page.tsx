import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ImageField, KeyTextField, SliceZone as SliceZoneField } from "@prismicio/client";

import SliceZone from "@/components/SliceZone";
import { getCmsPage } from "@/lib/cmsPages";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

import styles from "./Testimonials.module.css";

const UID = "testimonials";
const PATH = "/testimonials/";

/**
 * The `testimonials` page type is not yet in the generated Prismic types.
 * Remove this block and the cast after "Pull to local".
 */
type TestimonialsPage = {
	data: {
		slices: SliceZoneField;
		meta_title: KeyTextField;
		meta_description: KeyTextField;
		meta_image: ImageField;
	};
};

/**
 * The `testimonials` page type when it has a published document, otherwise
 * the `shared_section` page with the uid "testimonials" (the generic
 * Prismic page the content was first built in), so the URL keeps working
 * while the content moves to its own page type.
 */
async function getPage(): Promise<TestimonialsPage | null> {
	const client = createClient();

	const own = await (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(client as any).getSingle("testimonials") as Promise<TestimonialsPage>
	).catch(() => null);

	if (own) return own;

	return (await getCmsPage(client, UID)) as TestimonialsPage | null;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage();

	const title = page?.data.meta_title || "Testimonials - Cost Segregation";
	const description =
		page?.data.meta_description ||
		"Read what real estate investors and tax professionals say about CostSegregation.com.";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: PATH },
		openGraph: {
			type: "website",
			url: PATH,
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const page = await getPage();

	if (!page) notFound();

	return (
		// The wrapper scopes this page's slice overrides, so the same
		// slices keep their own styling everywhere else.
		<main className={styles.page}>
			<SliceZone slices={page.data.slices} components={components} />
		</main>
	);
}
