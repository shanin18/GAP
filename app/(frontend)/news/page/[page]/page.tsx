import type { Metadata } from "next";
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
  return { title: page ? `Blogs & Events, page ${page}` : "Blogs & Events" };
}

export default async function NewsArchivePage({ params }: Props) {
  const page = parsePage((await params).page);
  if (!page) notFound();
  if (page === 1) permanentRedirect("/news");
  return <NewsListing page={page} />;
}
