import Image from "next/image";

/** Shared photo layout for the About and counselling sections. */
export function EditorialImage({ src, alt = "", eager = false }: {
  src?: string | null;
  alt?: string;
  eager?: boolean;
}) {
  return (
    <div className="min-w-0">
      {src && <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/11]">
        <Image src={src} alt={alt} fill loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} sizes="(min-width: 1280px) 560px, (min-width: 1024px) 44vw, 90vw" className="object-cover" />
      </div>}
    </div>
  );
}
