import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/cms-queries";

import { getGlobeDestinations } from "@/lib/globe-destinations";

/**
 * Brand icons drawn inline (newer lucide-react versions no longer ship them).
 * Outline style, so they match the other footer icons.
 */
type IconProps = {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

function SvgIcon({
  size = 18,
  className,
  children,
  ...rest
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

const Facebook = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </SvgIcon>
);
const Instagram = (p: IconProps) => (
  <SvgIcon {...p}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </SvgIcon>
);
const Linkedin = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </SvgIcon>
);
const Youtube = (p: IconProps) => (
  <SvgIcon {...p}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </SvgIcon>
);

/** Icons for each platform option in the Payload "Social links" field. */
const SOCIAL_ICONS = {
  facebook: { label: "Facebook", Icon: Facebook },
  instagram: { label: "Instagram", Icon: Instagram },
  linkedin: { label: "LinkedIn", Icon: Linkedin },
  youtube: { label: "YouTube", Icon: Youtube },
} as const;

type SocialLinkRow = { platform?: string | null; url?: string | null };

/** Only allow real http(s) links coming from the CMS. */
function safeUrl(value?: string | null) {
  if (!value) return null;
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:"
      ? u.toString()
      : null;
  } catch {
    return null;
  }
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklch,var(--primary)_14%,var(--surface))] text-primary"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

export async function SiteFooter() {
  const [settings, destinations] = await Promise.all([
    getSiteSettings(),
    getGlobeDestinations(),
  ]);
  const hasContact = settings?.address || settings?.phone || settings?.email;

  // Managed in Payload: Site settings > Social links
  const rows =
    (settings as { socialLinks?: SocialLinkRow[] | null } | null)
      ?.socialLinks ?? [];
  const socials = rows.flatMap((row) => {
    const meta = SOCIAL_ICONS[row.platform as keyof typeof SOCIAL_ICONS];
    const href = safeUrl(row.url);
    return meta && href ? [{ ...meta, href }] : [];
  });

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" aria-label="GAP home" className="inline-flex">
            <Image
              src="/images/gap-logo.webp"
              alt="Global Admission Platform"
              width={140}
              height={99}
              className="rounded-lg"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Global education guidance from first conversation to final
            departure.
          </p>
        </div>
        <div>
          <h2 className="font-bold">Explore</h2>
          <div className="mt-3 grid justify-items-start text-sm text-muted-foreground">
            <Link
              className="inline-flex min-h-11 items-center transition-colors duration-200 ease-out hover:text-primary"
              href="/"
            >
              Home
            </Link>
            <Link
              className="inline-flex min-h-11 items-center transition-colors duration-200 ease-out hover:text-primary"
              href="/services"
            >
              Services
            </Link>
          </div>
        </div>
        <div>
          <h2 className="font-bold">Destinations</h2>
          <div className="mt-3 grid text-sm text-muted-foreground">
            {destinations.map(({ slug, name }) => (
              <Link
                className="inline-flex min-h-11 items-center transition-colors duration-200 ease-out hover:text-primary"
                key={slug}
                href={"/country/" + slug}
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold">Contact</h2>
          {hasContact ? (
            <address className="mt-4 space-y-4 text-sm not-italic leading-6 text-muted-foreground">
              {settings?.address && (
                <ContactRow icon={<MapPin size={16} />} label="Visit us">
                  <p className="mt-1 whitespace-pre-line">{settings.address}</p>
                </ContactRow>
              )}
              {settings?.phone && (
                <ContactRow icon={<Phone size={16} />} label="Call us">
                  <a
                    className="mt-1 inline-flex min-h-8 items-center transition-colors duration-200 ease-out hover:text-primary"
                    href={"tel:" + settings.phone.replace(/[^+0-9]/g, "")}
                  >
                    {settings.phone}
                  </a>
                </ContactRow>
              )}
              {settings?.email && (
                <ContactRow icon={<Mail size={16} />} label="Email us">
                  <a
                    className="mt-1 inline-flex min-h-8 items-center break-all transition-colors duration-200 ease-out hover:text-primary"
                    href={"mailto:" + settings.email}
                  >
                    {settings.email}
                  </a>
                </ContactRow>
              )}
            </address>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Start a conversation with our team about your study plans.
            </p>
          )}

          {socials.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
                Follow us
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {socials.map(({ label, Icon, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`GAP on ${label} (opens in a new tab)`}
                      className="grid size-11 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-200 ease-out hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <Icon aria-hidden="true" size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()}{" "}
        {settings?.siteName || "Global Admission Platform"}. All rights
        reserved.
      </div>
    </footer>
  );
}
