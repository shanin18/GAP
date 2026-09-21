import Link from "next/link";
import type { PayloadRequest, Where } from "payload";
import { Gutter } from "@payloadcms/ui";
import { ArrowUpRight, ClipboardList, Clock, FileText, Globe, Inbox, Newspaper, Plus, UserPlus } from "lucide-react";

type Props = { initPageResult: { req: PayloadRequest } };

const APPLICATION_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "profile-review", label: "Profile review" },
  { value: "documents-required", label: "Documents required" },
  { value: "ready-to-apply", label: "Ready to apply" },
  { value: "university-submitted", label: "Submitted to university" },
  { value: "offer-received", label: "Offer received" },
  { value: "enrolled", label: "Enrolled" },
  { value: "closed", label: "Closed" },
];
const statusLabel = (value?: string | null) =>
  APPLICATION_STATUSES.find((s) => s.value === value)?.label ?? value ?? "";
const LEAD_STATUS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  "application-started": "Application started",
  "not-proceeding": "Not proceeding",
};

function timeAgo(value?: string | null) {
  if (!value) return "";
  const seconds = (Date.now() - new Date(value).getTime()) / 1000;
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function count(req: PayloadRequest, collection: "leads" | "applications" | "documents", where?: Where) {
  try {
    const { totalDocs } = await req.payload.count({ collection, where, user: req.user ?? undefined, overrideAccess: false });
    return totalDocs;
  } catch {
    return 0;
  }
}

async function recentLeads(req: PayloadRequest) {
  try {
    const { docs } = await req.payload.find({
      collection: "leads", limit: 5, sort: "-createdAt", depth: 0,
      user: req.user ?? undefined, overrideAccess: false,
    });
    return docs;
  } catch {
    return [];
  }
}

async function recentApplications(req: PayloadRequest) {
  try {
    const { docs } = await req.payload.find({
      collection: "applications", limit: 5, sort: "-createdAt", depth: 1,
      user: req.user ?? undefined, overrideAccess: false,
    });
    return docs;
  } catch {
    return [];
  }
}

function Stat({ icon: Icon, label, value, hint, href }: { icon: typeof Inbox; label: string; value: number; hint: string; href: string }) {
  return (
    <Link href={href} className="gap-stat">
      <span className="gap-stat__icon" aria-hidden="true"><Icon size={20} /></span>
      <span className="gap-stat__value">{value}</span>
      <span className="gap-stat__label">{label}</span>
      <span className="gap-stat__hint">{hint}</span>
    </Link>
  );
}

export async function Dashboard({ initPageResult }: Props) {
  const { req } = initPageResult;
  const admin = req.payload.config.routes.admin;
  const now = new Date().toISOString();
  const closed = ["enrolled", "closed"];

  const [newLeads, openApps, needsUpdate, leadsDue, appsDue, byStatus, leads, applications] = await Promise.all([
    count(req, "leads", { status: { equals: "new" } }),
    count(req, "applications", { status: { not_in: closed } }),
    count(req, "documents", { reviewStatus: { equals: "needs-update" } }),
    count(req, "leads", { and: [{ followUpAt: { less_than_equal: now } }, { status: { not_in: ["not-proceeding", "application-started"] } }] }),
    count(req, "applications", { and: [{ nextActionAt: { less_than_equal: now } }, { status: { not_in: closed } }] }),
    Promise.all(APPLICATION_STATUSES.map((s) => count(req, "applications", { status: { equals: s.value } }))),
    recentLeads(req),
    recentApplications(req),
  ]);

  const total = byStatus.reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...byStatus);
  const name = req.user?.email?.split("@")[0] ?? "there";

  return (
    <Gutter>
      <div className="gap-dash">
        <header className="gap-dash__head">
          <div>
            <span className="gap-admin-eyebrow">Overview</span>
            <h1>Good guidance starts here.</h1>
            <p>Welcome back, {name}. Here is what needs attention today.</p>
          </div>
          <div className="gap-dash__actions">
            <Link href={`${admin}/collections/leads/create`} className="gap-chip"><UserPlus size={16} aria-hidden="true" /> New lead</Link>
            <Link href={`${admin}/collections/applications/create`} className="gap-chip"><Plus size={16} aria-hidden="true" /> New application</Link>
            <Link href={`${admin}/collections/news/create`} className="gap-chip"><Newspaper size={16} aria-hidden="true" /> New post</Link>
            <Link href="/" className="gap-chip"><Globe size={16} aria-hidden="true" /> View website <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>
        </header>

        <section className="gap-dash__stats" aria-label="Key numbers">
          <Stat icon={Inbox} label="New leads" value={newLeads} hint="Waiting for a first reply" href={`${admin}/collections/leads?where[status][equals]=new`} />
          <Stat icon={ClipboardList} label="Open applications" value={openApps} hint="Not yet enrolled or closed" href={`${admin}/collections/applications`} />
          <Stat icon={FileText} label="Documents to fix" value={needsUpdate} hint="Marked as needs update" href={`${admin}/collections/documents?where[reviewStatus][equals]=needs-update`} />
          <Stat icon={Clock} label="Follow-ups due" value={leadsDue + appsDue} hint={`${leadsDue} leads, ${appsDue} applications`} href={`${admin}/collections/leads`} />
        </section>

        <div className="gap-dash__grid">
          <section className="gap-panel" aria-labelledby="gap-pipeline">
            <div className="gap-panel__head">
              <h2 id="gap-pipeline">Application pipeline</h2>
              <span className="gap-panel__meta">{total} in total</span>
            </div>
            {total === 0 ? (
              <p className="gap-empty">No applications yet. They appear here as students apply.</p>
            ) : (
              <ul className="gap-pipeline">
                {APPLICATION_STATUSES.map((s, i) => (
                  <li key={s.value}>
                    <Link href={`${admin}/collections/applications?where[status][equals]=${s.value}`} className="gap-pipeline__row">
                      <span className="gap-pipeline__label">{s.label}</span>
                      <span className="gap-pipeline__bar" aria-hidden="true">
                        <span style={{ width: `${(byStatus[i] / max) * 100}%` }} />
                      </span>
                      <span className="gap-pipeline__count">{byStatus[i]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="gap-panel" aria-labelledby="gap-recent-leads">
            <div className="gap-panel__head">
              <h2 id="gap-recent-leads">Recent leads</h2>
              <Link href={`${admin}/collections/leads`} className="gap-panel__link">View all</Link>
            </div>
            {leads.length === 0 ? (
              <p className="gap-empty">No leads yet.</p>
            ) : (
              <ul className="gap-list">
                {leads.map((lead) => (
                  <li key={lead.id}>
                    <Link href={`${admin}/collections/leads/${lead.id}`} className="gap-list__row">
                      <span className="gap-list__main">
                        <strong>{lead.name}</strong>
                        <span>{lead.interestedCountry || lead.email}</span>
                      </span>
                      <span className="gap-list__side">
                        <span className="gap-tag">{LEAD_STATUS[lead.status] ?? lead.status}</span>
                        <time>{timeAgo(lead.createdAt)}</time>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="gap-panel" aria-labelledby="gap-recent-apps">
          <div className="gap-panel__head">
            <h2 id="gap-recent-apps">Recent applications</h2>
            <Link href={`${admin}/collections/applications`} className="gap-panel__link">View all</Link>
          </div>
          {applications.length === 0 ? (
            <p className="gap-empty">No applications yet.</p>
          ) : (
            <ul className="gap-list">
              {applications.map((app) => (
                <li key={app.id}>
                  <Link href={`${admin}/collections/applications/${app.id}`} className="gap-list__row">
                    <span className="gap-list__main">
                      <strong>{app.studentName}</strong>
                      <span>
                        {app.reference}
                        {typeof app.country === "object" && app.country ? ` · ${app.country.name}` : ""}
                      </span>
                    </span>
                    <span className="gap-list__side">
                      <span className="gap-tag">{statusLabel(app.status)}</span>
                      <time>{timeAgo(app.createdAt)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Gutter>
  );
}
