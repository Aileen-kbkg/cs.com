/**
 * Public origin used for canonical URLs, the sitemap and structured data.
 * Defaults to the production domain so preview and vercel.app URLs never
 * become canonical; override with NEXT_PUBLIC_SITE_URL if that changes.
 */
export const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costsegregation.com"
).replace(/\/+$/, "");

export const SITE_NAME = "Cost Segregation";
