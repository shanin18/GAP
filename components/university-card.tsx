"use client";
import { useWebsiteContent } from "@/components/website-content-provider";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { CmsUniversity } from "@/lib/cms-queries";
import { cardVariants } from "./ui/card";
import { cn } from "@/lib/utils";

export function UniversityCard({ university }: { university: CmsUniversity }) {
  const t = useWebsiteContent("university-card");

  const country =
    typeof university.country === "object"
      ? university.country?.name
      : undefined;
  return (
    <article
      className={cn(
        cardVariants({ interactive: true }),
        "group flex h-full flex-col",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-[var(--surface)]">
          {university.logoUrl ? (
            <img
              src={university.logoUrl}
              alt=""
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="font-display text-xl">
              {university.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {university.featured && (
          <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            {t("Featured")}
          </span>
        )}
      </div>
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin size={15} />
        <span>
          {[university.city, country].filter(Boolean).join(", ") ||
            "International destination"}
        </span>
      </div>
      <h2 className="mt-3 font-display text-2xl leading-tight">
        {university.name}
      </h2>
      <p className="mt-4 line-clamp-3 leading-7 text-muted-foreground">
        {t(university.description)}
      </p>
      <Link
        href={`/universities/${university.slug}`}
        prefetch={true}
        className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-lg pt-6 font-semibold text-primary transition-colors duration-200 hover:text-foreground active:opacity-80"
      >
        {t("View university ")}
        <span className="sr-only">{university.name}</span>
        <ArrowUpRight aria-hidden="true" size={17} />
      </Link>
    </article>
  );
}
