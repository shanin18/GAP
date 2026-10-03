import type { News } from "@/payload-types";

export function newsLabel(item: Pick<News, "entryType" | "eventDate">) {
  if (item.entryType !== "event") return "Blog";
  return item.eventDate && new Date(item.eventDate).getTime() > Date.now() ? "Upcoming event" : "Event";
}
