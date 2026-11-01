import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound, permanentRedirect } from "next/navigation";
import { NewsListing } from "@/components/news-listing";
import { getNewsPage } from "@/lib/cms-queries";

type Props = { params: Promise<{ page: string }> };

const parsePage = (value: string) => (/^[1-9]\d{0,5}$/.test(value) ? Number(value) : null);

export async function generateStaticParams() {
  const { totalPages } = await getNewsPage(1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = parsePage((await params).page);
  if (!page) return { title: "Blogs & Events" };
  return pageMetadata({
    title: `Blogs & Events, page ${page}`,
    description: "More study-abroad guidance, application advice and events from GAP.",
    path: `/news/page/${page}`,
  });
}

export default async function NewsArchivePage({ params }: Props) {
  const page = parsePage((await params).page);
  if (!page) notFound();
  if (page === 1) permanentRedirect("/news");
  return <NewsListing page={page} />;
}
