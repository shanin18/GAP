import { getCms } from "@/lib/payload";

// Runs daily via Vercel Cron (vercel.json). One small read keeps the free Supabase project active:
// Supabase pauses free projects after 7 days without database activity.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Vercel sends "Authorization: Bearer <CRON_SECRET>"; anything else is refused
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const payload = await getCms();
    const { totalDocs } = await payload.count({ collection: "site-settings", overrideAccess: true });
    return Response.json({ ok: true, checkedAt: new Date().toISOString(), records: totalDocs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[keepalive] database check failed:", error);
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
