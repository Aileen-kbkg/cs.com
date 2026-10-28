import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      {
        source: "/resources/blog/:uid",
        destination: "/resources/:uid",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;