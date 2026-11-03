import type { NextConfig } from "next";

import { LEGACY_BLOG_POSTS } from "./src/lib/postUrl";

const legacyBlogPosts = LEGACY_BLOG_POSTS.join("|");

const nextConfig: NextConfig = {
  // WordPress URLs end in a slash; keep them identical.
  trailingSlash: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.costsegregation.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.prismic.io",
        pathname: "/cost-segregation/**",
      },
      {
        protocol: "https",
        hostname: "*.prismic.io",
      },
    ],
  },

  async redirects() {
    return [
      // Old WordPress slug, redirected there too.
      {
        source:
          "/resources/blog/how-the-short-term-rental-loophole-costsegregation-com-can-benefit-passive-investors",
        destination: "/resources/blog/short-term-rental-cost-seg/",
        permanent: true,
      },
      // Posts WordPress published under /resources/blog/ keep that URL...
      {
        source: `/resources/:uid(${legacyBlogPosts})`,
        destination: "/resources/blog/:uid/",
        permanent: true,
      },
      // ...and every other /resources/blog/ post lives under /resources/.
      {
        source: `/resources/blog/:uid((?!(?:${legacyBlogPosts}|\\d+)(?:/|$))[^/]+)`,
        destination: "/resources/:uid/",
        permanent: true,
      },
      // Not a page on the live site; the homepage is /.
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      // Blog listing pages keep their WordPress URLs: /resources/blog/2/.
      {
        source: "/resources/blog/:page(\\d+)",
        destination: "/resources/blog/?page=:page",
      },
      {
        source: `/resources/blog/:uid(${legacyBlogPosts})`,
        destination: "/resources/:uid/",
      },
    ];
  },
};

export default nextConfig;