/**
 * WordPress published these posts under /resources/blog/ rather than
 * /resources/, and their URLs are kept as they were.
 */
export const LEGACY_BLOG_POSTS = [
	"can-you-do-cost-segregation-on-residential-rental-property",
	"short-term-rental-cost-seg",
] as const;

const isLegacyBlogPost = (uid: string) =>
	(LEGACY_BLOG_POSTS as readonly string[]).includes(uid);

/** Site-relative URL of a blog post, with the trailing slash WordPress used. */
export const postPath = (uid: string): string =>
	isLegacyBlogPost(uid) ? `/resources/blog/${uid}/` : `/resources/${uid}/`;
