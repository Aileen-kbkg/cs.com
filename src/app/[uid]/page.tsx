import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SliceZone from "@/components/SliceZone";
import { getAllCmsPages, getCmsPage, isNoindex } from "@/lib/cmsPages";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

/**
 * Generic page for content built entirely in Prismic, so new pages need
 * no code: a `shared_section` tagged `page` is served at /<uid>/.
 * Routes with their own folder (/about/, /faq/…) always take precedence.
 */
type Props = { params: Promise<{ uid: string }> };

export async function generateStaticParams() {
	const pages = await getAllCmsPages(createClient());

	return pages
		.filter((page) => typeof page.uid === "string" && page.uid.length > 0)
		.map((page) => ({ uid: page.uid as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { uid } = await params;
	const page = await getCmsPage(createClient(), uid);

	if (!page) return {};

	const title = page.data.meta_title || page.data.name || undefined;
	const description = page.data.meta_description || undefined;
	const image = page.data.meta_image?.url ?? undefined;

	return {
		title,
		description,
		alternates: { canonical: `/${uid}/` },
		robots: isNoindex(page) ? { index: false, follow: false } : undefined,
		openGraph: {
			type: "website",
			url: `/${uid}/`,
			title,
			description,
			images: image ? [{ url: image }] : undefined,
		},
	};
}

export default async function Page({ params }: Props) {
	const { uid } = await params;
	const page = await getCmsPage(createClient(), uid);

	if (!page) notFound();

	return (
		<main>
			<SliceZone slices={page.data.slices} components={components} />
		</main>
	);
}
