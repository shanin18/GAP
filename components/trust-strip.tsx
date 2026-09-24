import { Badge } from "./ui/badge";
import { getSectionText } from "@/lib/website-content-server";

const items = [
  "Human-led guidance",
  "Clear next steps",
  "Trusted destinations",
];

export async function TrustStrip() {
  const t = await getSectionText("trust-strip");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <Badge key={item}>{t(item)}</Badge>
      ))}
    </div>
  );
}
