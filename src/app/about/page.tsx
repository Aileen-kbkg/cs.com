import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { ImageField } from "@prismicio/client"
import styles from "./About.module.css";
/**
 * The `about` custom type is not yet in the generated Prismic types.
 * Remove this once prismicio-types.d.ts has been regenerated.
 */
type AboutDocument = {
  data: {
    slices: never[];
    meta_title: string | null;
    meta_description: string | null;
    meta_image: ImageField;
  };
};

async function getAbout() {
  const client = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client as any).getSingle("about") as Promise<AboutDocument>;
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getAbout().catch(() => null);

	if (!page) {
		return { title: "About" };
	}


	const title = page.data.meta_title || "About - Cost Segregation";
	const description = page.data.meta_description || undefined;
	const image = page.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: {
			canonical: "/about",
		},
		openGraph: {
			type: "article",
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page() {
	const page = await getAbout().catch(() => null);

	if (!page) {
		notFound();
	}

		return (
		<main className={styles.page}>
			<SliceZone slices={page.data.slices} components={components} />
		</main>
	);
}