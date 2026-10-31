import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { ImageField, RichTextField } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import SliceZone, { splitAnnouncementBar } from "@/components/SliceZone";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

import styles from "./TrendsEbook.module.css";

/**
 * The `trends_ebook` type is not yet in the generated Prismic types.
 * Remove this block and the cast after "Pull to local".
 */
type Card = {
	icon: ImageField;
	title: string | null;
	description: RichTextField;
};

type TrendsEbookDocument = {
	data: {
		hero_image: ImageField;
		hero_heading: string | null;
		hero_subtitle: RichTextField;
		hero_title: RichTextField;
		hubspot_portal_id: string | null;
		hubspot_form_id: string | null;
		hubspot_region: string | null;
		card: Card[];
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
		"trends_ebook",
	) as Promise<TrendsEbookDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title =
		page?.data.meta_title ||
		"Top 5 Trends to Expect to see in Cost Segregation Industry - Cost Segregation";
	const description =
		page?.data.meta_description ||
		"Simplified Cost Segregation reports with user-friendly software backed by industry experts.";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/trends-ebook" },
		// Matches the live page, which is a gated landing page.
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
		hero_image,
		hero_heading,
		hero_subtitle,
		hero_title,
		hubspot_portal_id,
		hubspot_form_id,
		hubspot_region,
		card,
		slices,
	} = page.data;

	const cards = card ?? [];
	const hasForm = Boolean(hubspot_portal_id && hubspot_form_id);
	const { announcementBar, rest } = splitAnnouncementBar(slices);

	return (
		<main className={styles.page}>
			<SliceZone slices={announcementBar} components={components} />
			<section className={styles.hero}>
				<div className={styles.heroInner}>
					{/* Hidden below 1024px, as on the live page. */}
					<div className={styles.heroAside}>
						{hero_image?.url ? (
							<PrismicNextImage
								field={hero_image}
								className={styles.heroImage}
								sizes="(max-width: 1023px) 0px, 45vw"
								priority
								fallbackAlt=""
							/>
						) : null}

						{hero_heading ? (
							<h2 className={styles.heroHeading}>{hero_heading}</h2>
						) : null}

						{hero_subtitle?.length ? (
							<div className={styles.heroSubtitle}>
								<PrismicRichText field={hero_subtitle} />
							</div>
						) : null}
					</div>

					<div className={styles.heroMain}>
						{hero_title?.length ? (
							<PrismicRichText
								field={hero_title}
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

			{cards.length > 0 ? (
				<section className={styles.cards}>
					<div className={styles.cardsInner}>
						<h2 className={styles.cardsTitle}>
							Quick and Easy Cost Segregation Results
						</h2>

						<ul className={styles.cardGrid}>
							{cards.map((item, index) => (
								<li
									key={`${item.title ?? "card"}-${index}`}
									className={styles.card}
								>
									{item.icon?.url ? (
										<div className={styles.cardIconWrap}>
											<PrismicNextImage
												field={item.icon}
												className={styles.cardIcon}
												sizes="60px"
												fallbackAlt=""
											/>
										</div>
									) : null}

									{item.title ? (
										<h3 className={styles.cardTitle}>{item.title}</h3>
									) : null}

									{item.description?.length ? (
										<div className={styles.cardText}>
											<PrismicRichText field={item.description} />
										</div>
									) : null}
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}

			<SliceZone slices={rest} components={components} />
		</main>
	);
}