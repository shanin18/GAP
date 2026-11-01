import { NewsListing } from "@/components/news-listing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blogs & Events",
  description:
    "Study-abroad guidance, application advice and destination insights from GAP.",
  path: "/news",
});

export default function NewsPage() {
  return <NewsListing page={1} />;
}
