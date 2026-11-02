import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText, type LinkField, type RichTextField } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { createClient } from "@/prismicio";

import styles from "./Resources.module.css";

/**
 * The `resources` custom type is not yet in the generated Prismic types.
 * Remove this block and the cast in getResources() after "Pull to local".
 */
type ResourceCard = {
	title: string | null;
	text: RichTextField;
	link: LinkField;
	link_label: string | null;
};

type ResourcesDocument = {
	data: {
		heading: string | null;
		intro: RichTextField;
		cards: ResourceCard[];
		meta_title: string | null;
		meta_description: RichTextField;
		meta_image: { url: string | null } | null;
	};
};

async function getResources() {
	const client = createClient();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (client as any).getSingle("resources") as Promise<ResourcesDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getResources().catch(() => null);

	const title = page?.data.meta_title || "Resources - Cost Segregation";
	const description =
		(page?.data.meta_description ? asText(page.data.meta_description) : "") ||
		"Explore cost segregation resources. Looking for cost segregation resources? This page is full of cost seg insights, assistance, guides, and more!";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/resources/" },
		openGraph: {
			type: "article",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const page = await getResources().catch(() => null);

	if (!page) {
		notFound();
	}

	const { heading, intro, cards } = page.data;

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

			{cards?.length ? (
				<div className={styles.cards}>
					{cards.map((card, index) => (
						<section key={`${card.title ?? "card"}-${index}`} className={styles.card}>
							{card.title ? (
								<h2 className={styles.cardTitle}>{card.title}</h2>
							) : null}

							{card.text?.length ? (
								<div className={styles.cardText}>
									<PrismicRichText field={card.text} />
								</div>
							) : null}

							{card.link ? (
								<PrismicNextLink field={card.link} className={styles.cardButton}>
									{card.link_label || "Learn more"}
								</PrismicNextLink>
							) : null}
						</section>
					))}
				</div>
			) : null}
		</main>
	);
}