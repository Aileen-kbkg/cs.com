import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFilled } from "@prismicio/client";
import type { ImageField, KeyTextField, LinkField, RichTextField } from "@prismicio/client";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import PartnerHeader, { type PartnerLogo } from "@/components/PartnerHeader";

import styles from "./EmpoweredInvestor.module.css";

/**
 * The `empowered_investor` page type is not yet in the generated Prismic
 * types. Remove this block and the cast after "Pull to local".
 */
type EmpoweredInvestorDocument = {
	data: {
		partner_logos: PartnerLogo[];
		eyebrow: RichTextField;
		heading: KeyTextField;
		intro: RichTextField;
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
		"empowered_investor",
	) as Promise<EmpoweredInvestorDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title =
		page?.data.meta_title || "Empowered Investor - CostSegregation.com";
	const description =
		page?.data.meta_description ||
		"Accelerate returns with smarter tax savings.";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/empowered-investor" },
		// Partner landing page — not for search.
		robots: { index: false, follow: true },
		openGraph: {
			type: "website",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const client = createClient();

	const [page, settings] = await Promise.all([
		getPage().catch(() => null),
		client.getSingle("site_settings").catch(() => null),
	]);

	if (!page) {
		notFound();
	}

	const { partner_logos, eyebrow, heading, intro, slices } = page.data;

	const signIn =
		settings?.data.sign_in_label && isFilled.link(settings.data.sign_in_link)
			? {
					label: settings.data.sign_in_label,
					link: settings.data.sign_in_link as LinkField,
				}
			: null;

	const getStarted =
		settings?.data.get_started_label &&
		isFilled.link(settings.data.get_started_link)
			? {
					label: settings.data.get_started_label,
					link: settings.data.get_started_link as LinkField,
				}
			: null;

	return (
		<>
			{/* Wrapped so this page's CSS can size the three logos as live does
			    without touching the shared header on S8 / Roofstock. */}
			<div className={styles.partnerHeader}>
				<PartnerHeader
					logo={settings?.data.logo as ImageField}
					partnerLogos={partner_logos ?? []}
					signIn={signIn}
					getStarted={getStarted}
				/>
			</div>

			<main className={styles.page}>
				<section className={styles.hero}>
					<div className={styles.heroInner}>
						<div className={styles.heroHeadline}>
							{isFilled.richText(eyebrow) && (
								<div className={styles.eyebrow}>
									<PrismicRichText field={eyebrow} />
								</div>
							)}
							{heading && <h1 className={styles.heading}>{heading}</h1>}
						</div>

						{intro?.length ? (
							<div className={styles.heroIntro}>
								<PrismicRichText field={intro} />
							</div>
						) : null}
					</div>
				</section>

				<div className={styles.empoweredInvestorSlices}>
					<SliceZone slices={slices} components={components} />
				</div>
			</main>
		</>
	);
}