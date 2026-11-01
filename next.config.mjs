import { withPayload } from "@payloadcms/next/withPayload";
import { validateEnvironment } from "./lib/validate-environment.mjs";
import { remoteImageHosts, remoteImagePatterns } from "./lib/image-hosts.mjs";

validateEnvironment(process.env);

// Comma-separated list of hosts your editors paste image links from, e.g.
// IMAGE_HOSTS=images.unsplash.com,cdn.example.com
const imageHosts = remoteImageHosts(process.env);

// The public domain, e.g. globaladmissionplatform.com. Not set for local development.
const siteHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname.replace(/^www\./, ""); } catch { return ""; }
})();
const canonicalHost = siteHost && !/^(localhost|127\.)/.test(siteHost) ? siteHost : "";

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
  // Lets <CmsImage> skip the optimizer for links outside the allowed hosts
  env: { GAP_REMOTE_IMAGE_HOSTS: imageHosts.join(",") },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: remoteImagePatterns(imageHosts),
  },
  async redirects() {
    return [
      // The application form was removed; students start with "Book an appointment" on the homepage
      { source: "/apply", destination: "/", permanent: true },
      {
        // News pagination moved from ?page=N to /news/page/N so listings can be prerendered
        source: "/news",
        has: [{ type: "query", key: "page", value: "(?<page>[1-9]\\d*)" }],
        destination: "/news/page/:page",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Keep duplicate copies (e.g. project.vercel.app) out of search results: only the real domain is indexed
      ...(canonicalHost
        ? [{
            source: "/:path*",
            missing: [{ type: "host", value: `(www\\.)?${canonicalHost.replace(/\./g, "\\.")}` }],
            headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
          }]
        : []),
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
