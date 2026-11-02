import type { MetadataRoute } from "next";

import { createClient } from "@/prismicio";
import { postPath } from "@/lib/postUrl";
import { SITE_URL } from "@/lib/site";

/** The pages listed in the live WordPress page sitemap. */
const PAGES = [
	"/",
	"/tutorial-video-step-by-step-platform/",
	"/trends-ebook/",
	"/resources/blog/",
	"/resources/",
	"/for-tax-advisors/",
	"/affiliate-program/",
	"/about/",
	"/resources/what-is-cost-segregation/",
	"/faq/",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const client = createClient();

	const posts = await client
		.getAllByType("blog_post", {
			orderings: [{ field: "my.blog_post.date", direction: "desc" }],
		})
		.catch(() => []);

	return [
		...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
		...posts
			.filter((post) => typeof post.uid === "string" && post.uid.length > 0)
			.map((post) => ({
				url: `${SITE_URL}${postPath(post.uid as string)}`,
				lastModified: post.last_publication_date,
			})),
	];
}
