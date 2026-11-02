import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ImageField, LinkField, RichTextField } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextLink } from "@prismicio/next";
import SliceZone, { splitAnnouncementBar } from "@/components/SliceZone";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

import TutorialVideo from "./TutorialVideo";
import styles from "./Tutorial.module.css";

/**
 * Fallback while the mp4 still lives on the WordPress origin. Once the
 * video is uploaded to Prismic and the `video` field is set, this is
 * ignored — and can be deleted after the old site is decommissioned.
 */
const FALLBACK_VIDEO =
	"https://www.costsegregation.com/wp-content/uploads/2025/12/cost-segregation-com-tutorial.mp4";

/**
 * The `tutorial` type is not yet in the generated Prismic types.
 * Remove this block and the cast after "Pull to local".
 */
type TutorialDocument = {
	data: {
		heading: string | null;
		video: LinkField;
		poster: ImageField;
		body: RichTextField;
		slices: never[];
		meta_title: string | null;
		meta_description: string | null;
		meta_image: ImageField;
	};
};

async function getTutorial() {
	const client = createClient();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (client as any).getSingle("tutorial") as Promise<TutorialDocument>;
}

function mediaUrl(field: LinkField): string | null {
	if (!field) return null;
	const url = (field as { url?: string }).url;
	return url ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getTutorial().catch(() => null);

	const title =
		page?.data.meta_title ||
		"CostSegregation.com Platform Step-by-Step Tutorial Video - Cost Segregation";
	const description =
		page?.data.meta_description ||
		"A step-by-step video tutorial showing how to complete a cost segregation study using the CostSegregation.com platform.";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/tutorial-video-step-by-step-platform" },
		openGraph: {
			type: "article",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const page = await getTutorial().catch(() => null);

	if (!page) {
		notFound();
	}

	const { heading, video, poster, body, slices } = page.data;
	const videoSrc = mediaUrl(video) ?? FALLBACK_VIDEO;
	const { announcementBar, rest } = splitAnnouncementBar(slices);

	return (
		<main className={styles.page}>
			<SliceZone slices={announcementBar} components={components} />

			<section className={styles.hero}>
				<div className={styles.heroInner}>
					{heading ? <h1 className={styles.title}>{heading}</h1> : null}

					{videoSrc ? (
						<div className={styles.videoWrap}>
							<TutorialVideo
								className={styles.video}
								src={videoSrc}
								poster={poster?.url ?? undefined}
							/>
						</div>
					) : null}
				</div>
			</section>

			{body?.length ? (
				<div className={styles.content}>
					<PrismicRichText
						field={body}
						components={{
							heading2: ({ children, key }) => (
								<h2 key={key} className={styles.sectionTitle}>
									{children}
								</h2>
							),
							list: ({ children, key }) => (
								<ul key={key} className={styles.list}>
									{children}
								</ul>
							),
							hyperlink: ({ children, node, key }) => (
								<PrismicNextLink
									key={key}
									field={node.data}
									className={styles.cta}
								>
									{children}
								</PrismicNextLink>
							),
						}}
					/>
				</div>
			) : null}

			<SliceZone slices={rest} components={components} />
		</main>
	);
}