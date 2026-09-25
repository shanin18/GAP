import { withPayload } from "@payloadcms/next/withPayload";
import { validateEnvironment } from "./lib/validate-environment.mjs";

validateEnvironment(process.env);

// Comma-separated list of hosts your editors paste image links from, e.g.
// IMAGE_HOSTS=images.unsplash.com,cdn.example.com
const imageHosts = (process.env.IMAGE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);
if (!imageHosts.length && process.env.NODE_ENV === "production") {
  console.warn(
    "[next.config] IMAGE_HOSTS is not set: remote images are allowed from ANY host.",
  );
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Only send this once the whole site is served over HTTPS
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains",
        },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: imageHosts.length
      ? imageHosts.map((hostname) => ({ protocol: "https", hostname }))
      : [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        // Static files in /public/images: cache for a day, refresh in the background for a week
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};
export default withPayload(nextConfig);
