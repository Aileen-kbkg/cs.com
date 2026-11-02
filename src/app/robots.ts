import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	// Preview deployments must not be indexed.
	if (process.env.VERCEL_ENV === "preview") {
		return { rules: { userAgent: "*", disallow: "/" } };
	}

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/", "/slice-simulator/"],
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
