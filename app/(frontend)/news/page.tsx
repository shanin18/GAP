import { NewsListing } from "@/components/news-listing";

export const metadata = {
  title: "Blogs & Events",
  description:
    "Study-abroad guidance, application advice and destination insights from GAP.",
};

export default function NewsPage() {
  return <NewsListing page={1} />;
}
