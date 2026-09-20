import type { ServerProps } from "payload";
import { getTranslation } from "@payloadcms/translations";
import { CollectionLinksClient } from "./CollectionLinksClient";

// Preserve Payload's read permissions and hidden-collection rules in the flat navigation.
export function CollectionLinks({
  payload,
  permissions,
  user,
  i18n,
}: ServerProps) {
  const items = payload.config.collections
    .filter(({ slug, admin }) => {
      if (!permissions?.collections?.[slug]?.read || !user) return false;
      const clientUser = {
        ...user,
        sessions: user.sessions?.flatMap((session) =>
          session.createdAt
            ? [{ ...session, createdAt: session.createdAt }]
            : [],
        ),
      };
      try {
        return !(typeof admin.hidden === "function"
          ? admin.hidden({ user: clientUser })
          : admin.hidden);
      } catch {
        return false;
      }
    })
    .map(({ slug, labels }) => ({
      slug,
      label:
        typeof labels.plural === "function"
          ? slug
          : getTranslation(labels.plural, i18n),
      href: `${payload.config.routes.admin}/collections/${slug}`,
    }));
  return <CollectionLinksClient items={items} />;
}
