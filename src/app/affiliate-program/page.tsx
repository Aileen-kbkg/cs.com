import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { isFilled } from "@prismicio/client";
import type { ImageField, RichTextField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import SliceZone, { splitAnnouncementBar } from "@/components/SliceZone";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

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
		slices,
	} = page.data;

	const hasForm = Boolean(hubspot_portal_id && hubspot_form_id);
	const { announcementBar, rest } = splitAnnouncementBar(slices);

	return (
		<main className={styles.page}>
			<SliceZone slices={announcementBar} components={components} />

			<section className={styles.section}>
				<div className={styles.inner}>
					{/* Desktop only; the column stays as an empty track on tablet. */}
					<div className={styles.aside}>
						{isFilled.image(image) ? (
							<PrismicNextImage
								field={image}
								className={styles.illustration}
								sizes="(max-width: 1024px) 0px, 562px"
								// imgix compression blurs the illustration's edges.
								imgixParams={{ auto: ["format"] }}
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
						{/* Paragraphs under the heading are the tablet/mobile intro. */}
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
										<p key={key} className={styles.introMobile}>
											{children}
										</p>
									),
								}}
							/>
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
			</section>

			<SliceZone slices={rest} components={components} />
		</main>
	);
}
