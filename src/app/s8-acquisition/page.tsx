import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFilled } from "@prismicio/client";
import type { ImageField, LinkField } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import PartnerHeader, { type PartnerLogo } from "@/components/PartnerHeader";

import styles from "./S8Acquisition.module.css";

/**
 * The `s8_acquisition` page type is not yet in the generated Prismic
 * types. Remove this block and the cast after "Pull to local".
 *
 * Note the group field is `image`, not `logo`, and carries no per-logo
 * link — hence the mapping below before passing to PartnerHeader.
 */
type S8AcquisitionDocument = {
	data: {
		partner_logos: { image: ImageField }[];
		link: LinkField;
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
		"s8_acquisition",
	) as Promise<S8AcquisitionDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title =
		page?.data.meta_title ||
		"CostSegregation / S8 Acquisition - Cost Segregation";
	const description = page?.data.meta_description || "Maximize Your Tax Savings";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/s8-acquisition/" },
		// Partner page — follow, noindex, matching the live reference.
		robots: { index: false, follow: true },
		openGraph: {
			type: "article",
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

	// The co-branded lockup is a single image with no link of its own.
	const partnerLogos: PartnerLogo[] = (page.data.partner_logos ?? [])
		.filter((entry) => isFilled.image(entry.image))
		.map((entry) => ({
			logo: entry.image,
			link: {} as LinkField,
		}));

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
			{/* Co-branded header — no navigation menu, as on the live page.
			    HeaderSlot suppresses the standard Navbar for this route. */}
			<PartnerHeader
  partnerLogos={partnerLogos}
  partnerLogoClassName={styles.partnerLogo}
  partnerLogoHeight={179}
  signIn={signIn}
  getStarted={getStarted}
  actionsClassName={styles.partnerActions}
/>
<div className={styles.slices}>
		<SliceZone
	slices={page.data.slices}
	components={components}
	context={{ page: "s8-acquisition" }}
/>
			</div>
		</>
	);
}