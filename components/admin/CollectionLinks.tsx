import type { ServerProps, Where } from "payload";
import { getTranslation } from "@payloadcms/translations";
import { CollectionLinksClient, type NavGroup } from "./_CollectionLinksClient";

// How the sidebar is organised. Collections not listed here still appear, under "More".
const GROUPS: { title: string; slugs: string[] }[] = [
  { title: "CRM", slugs: ["leads", "applications", "documents"] },
  { title: "Content", slugs: ["countries", "universities", "services", "testimonials", "news"] },
  { title: "Settings", slugs: ["site-settings", "users"] },
];

async function countOf(
  payload: ServerProps["payload"],
  collection: "leads" | "applications",
  where: Where,
  user: ServerProps["user"],
) {
  try {
    const { totalDocs } = await payload.count({ collection, where, user: user ?? undefined, overrideAccess: false });
    return totalDocs;
  } catch {
    return 0;
  }
}

// Keeps Payload's read permissions and hidden-collection rules in the navigation.
export async function CollectionLinks({ payload, permissions, user, i18n }: ServerProps) {
  const visible = payload.config.collections
    .filter(({ slug, admin }) => {
      if (!permissions?.collections?.[slug]?.read || !user) return false;
      const clientUser = {
        ...user,
        sessions: user.sessions?.flatMap((session) =>
          session.createdAt ? [{ ...session, createdAt: session.createdAt }] : [],
        ),
      };
      try {
        return !(typeof admin.hidden === "function" ? admin.hidden({ user: clientUser }) : admin.hidden);
      } catch {
        return false;
      }
    })
    .map(({ slug, labels }) => ({
      slug,
      label: typeof labels.plural === "function" ? slug : (getTranslation(labels.plural, i18n) as string),
      href: `${payload.config.routes.admin}/collections/${slug}`,
    }));

  // Small counters on the two inboxes that need daily attention
  const [newLeads, newApplications] = await Promise.all([
    visible.some((c) => c.slug === "leads") ? countOf(payload, "leads", { status: { equals: "new" } }, user) : 0,
    visible.some((c) => c.slug === "applications")
      ? countOf(payload, "applications", { status: { equals: "submitted" } }, user)
      : 0,
  ]);
  const badges: Record<string, number> = { leads: newLeads, applications: newApplications };

  const used = new Set<string>();
  const groups: NavGroup[] = GROUPS.map(({ title, slugs }) => ({
    title,
    items: slugs.flatMap((slug) => {
      const item = visible.find((c) => c.slug === slug);
      if (!item) return [];
      used.add(slug);
      return [{ ...item, badge: badges[slug] ?? 0 }];
    }),
  }));
  const rest = visible.filter((c) => !used.has(c.slug)).map((c) => ({ ...c, badge: 0 }));
  if (rest.length) groups.push({ title: "More", items: rest });

  return <CollectionLinksClient dashboardHref={payload.config.routes.admin} groups={groups.filter((g) => g.items.length)} />;
}
