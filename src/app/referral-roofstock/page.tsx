import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isFilled } from "@prismicio/client";
import type { ImageField, LinkField } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import PartnerHeader, { type PartnerLogo } from "@/components/PartnerHeader";

import styles from "./referral.module.css";


/**
 * The `referral_roofstock` page type is not yet in the generated Prismic
 * types. Remove this block and the cast after "Pull to local".
 */
type ReferralRoofstockDocument = {
	data: {
		partner_logos: PartnerLogo[];
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
		"referral_roofstock",
	) as Promise<ReferralRoofstockDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title =
		page?.data.meta_title || "Roofstock Referral - CostSegregation.com";
	const description =
		page?.data.meta_description ||
		"Roofstock members get 10% off their first CostSegregation.com study.";
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/referral-roofstock" },
		// Partner referral page — not for search.
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
				logo={settings?.data.logo as ImageField}
				partnerLogos={page.data.partner_logos ?? []}
				signIn={signIn}
				getStarted={getStarted}
			/>

			<div className={styles.slices}>
						<SliceZone slices={page.data.slices} components={components} />
						</div>
		</>
	);
}