import type { Client, Content } from "@prismicio/client";

/**
 * Pages built entirely in Prismic: `shared_section` documents tagged
 * `page` are served at /<uid>/ by the generic route. The tag keeps the
 * reusable sections (pricing, calculator, newsletter bar…) private.
 */
export const PAGE_TAG = "page";

/** Tag that keeps a page out of search results and the sitemap. */
export const NOINDEX_TAG = "noindex";

export type CmsPage = Content.SharedSectionDocument;

export const isCmsPage = (doc: { tags: string[] }) => doc.tags.includes(PAGE_TAG);

export const isNoindex = (doc: { tags: string[] }) => doc.tags.includes(NOINDEX_TAG);

export async function getCmsPage(client: Client, uid: string): Promise<CmsPage | null> {
	const doc = (await client
		.getByUID("shared_section", uid)
		.catch(() => null)) as CmsPage | null;
	return doc && isCmsPage(doc) ? doc : null;
}

export async function getAllCmsPages(client: Client): Promise<CmsPage[]> {
	return (await client
		.getAllByType("shared_section", {
			filters: [`[at(document.tags, ["${PAGE_TAG}"])]`],
		})
		.catch(() => [])) as CmsPage[];
}
