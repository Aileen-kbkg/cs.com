import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText, type RichTextField } from "@prismicio/client";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

import styles from "./Faq.module.css";

/**
 * The `faq` custom type is not yet in the generated Prismic types.
 * Remove this block and the cast in getFaq() once
 * prismicio-types.d.ts has been regenerated.
 */
type SeoMetadata = {
	meta_title: string | null;
	meta_description: RichTextField;
	meta_image: { url: string | null } | null;
};

type FaqDocument = {
	data: {
		heading: string | null;
		intro: RichTextField;
		slices: never[];
		seo_metadata: SeoMetadata[];
	};
};

async function getFaq() {
	const client = createClient();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (client as any).getSingle("faq") as Promise<FaqDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getFaq().catch(() => null);
	const seo = page?.data.seo_metadata?.[0];

	const title = seo?.meta_title || "FAQ - Cost Segregation";
	const description =
		(seo?.meta_description ? asText(seo.meta_description) : "") ||
		"We've collected the most common questions about cost seg here, but if you have any additional questions, please send them to info@costsegregation.com.";
	const image = seo?.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/faq" },
		openGraph: {
			type: "article",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const page = await getFaq().catch(() => null);

	if (!page) {
		notFound();
	}

	const { heading, intro, slices } = page.data;

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				{heading ? <h1 className={styles.title}>{heading}</h1> : null}

				{intro?.length ? (
					<div className={styles.intro}>
						<PrismicRichText field={intro} />
					</div>
				) : null}
			</header>

			<div className={styles.sections}>
				<SliceZone slices={slices} components={components} />
			</div>
		</main>
	);
}