export function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 font-display text-3xl leading-[1.15] tracking-tight sm:text-4xl">
        {title}
      </h2>
      {text && <p className="mt-4 leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}
