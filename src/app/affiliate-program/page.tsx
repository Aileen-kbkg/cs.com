import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { ImageField, RichTextField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { createClient } from "@/prismicio";

import styles from "./AffiliateProgram.module.css";

/**
 * The `affiliate_program` type is not yet in the generated Prismic types.
 * Remove this block and the cast after "Pull to local".
 */
type AffiliateProgramDocument = {
	data: {
		image: ImageField;
		heading: RichTextField;
		intro: RichTextField;
		form_heading: RichTextField;
		hubspot_portal_id: string | null;
		hubspot_form_id: string | null;
		hubspot_region: string | null;
		meta_title: string | null;
		meta_description: string | null;
		meta_image: ImageField;
	};
};

async function getPage() {
	const client = createClient();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (client as any).getSingle(
		"affiliate_program",
	) as Promise<AffiliateProgramDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title =
		page?.data.meta_title ||
		"CostSegregation.com Affiliate Program - Cost Segregation";
	const description = page?.data.meta_description || undefined;
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/affiliate-program" },
		// Matches the live page, which is noindex, nofollow.
		robots: { index: false, follow: false },
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

	const {
		image,
		heading,
		intro,
		form_heading,
		hubspot_portal_id,
		hubspot_form_id,
		hubspot_region,
	} = page.data;

	const hasForm = Boolean(hubspot_portal_id && hubspot_form_id);

	return (
		<main className={styles.page}>
			<div className={styles.inner}>
				{/* Desktop-only, as on the live page. */}
				<div className={styles.aside}>
					{image?.url ? (
						<PrismicNextImage
							field={image}
							className={styles.illustration}
							sizes="(max-width: 100%) 0px, 50vw"
							priority
							fallbackAlt=""
						/>
					) : null}

					{heading?.length ? (
						<PrismicRichText
							field={heading}
							components={{
								heading1: ({ children, key }) => (
									<h1 key={key} className={styles.title}>
										{children}
									</h1>
								),
								paragraph: ({ children, key }) => (
									<h1 key={key} className={styles.title}>
										{children}
									</h1>
								),
							}}
						/>
					) : null}

					{intro?.length ? (
						<div className={styles.intro}>
							<PrismicRichText field={intro} />
						</div>
					) : null}
				</div>

				<div className={styles.main}>
					{form_heading?.length ? (
						<PrismicRichText
							field={form_heading}
							components={{
								heading2: ({ children, key }) => (
									<h2 key={key} className={styles.formTitle}>
										{children}
									</h2>
								),
								paragraph: ({ children, key }) => (
									<h2 key={key} className={styles.formTitle}>
										{children}
									</h2>
								),
							}}
						/>
					) : null}

					{/* The live page repeats the intro here on mobile only. */}
					{intro?.length ? (
						<div className={styles.introMobile}>
							<PrismicRichText field={intro} />
						</div>
					) : null}

					{hasForm ? (
						<div className={styles.formPanel}>
							<div
								className="hs-form-frame"
								data-region={hubspot_region || "na1"}
								data-form-id={hubspot_form_id as string}
								data-portal-id={hubspot_portal_id as string}
							/>
							<Script
								src={`https://js.hsforms.net/forms/embed/${hubspot_portal_id}.js`}
								strategy="afterInteractive"
							/>
						</div>
					) : null}
				</div>
			</div>
		</main>
	);
}