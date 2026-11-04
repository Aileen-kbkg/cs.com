import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Content } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

import styles from "./Services.module.css";

async function getPage() {
	const client = createClient();

	return client.getSingle<Content.ServicesDocument>("services");
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage().catch(() => null);

	const title = page?.data.meta_title || "Services - Cost Segregation";
	const description = page?.data.meta_description || undefined;
	const image = page?.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: "/services/" },
		openGraph: {
			type: "website",
			url: "/services/",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	// Until a Services document is published in Prismic this is a 404.
	const page = await getPage().catch(() => null);

	if (!page) {
		notFound();
	}

	return (
		// The wrapper scopes this page's slice overrides, so the same
		// slices keep their own styling everywhere else.
		<main className={styles.page}>
			<SliceZone slices={page.data.slices} components={components} />
		</main>
	);
}
