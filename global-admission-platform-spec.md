# Global Admission Platform — Technical Specification

A complete build spec for a fast, custom-coded, content-manageable study-abroad consultancy website (styled in the spirit of csbbd.com, not a copy), covering architecture, stack, CMS, performance, and project structure.

> **Scope confirmed from client sketches:** the site is **3 page templates** — Home, Country, and Services — not the fuller multi-page sitemap originally drafted. Home carries most of the content (About Us, Academic Guidance, "How GAP Works," testimonials, news feed, partner marquee, footer). Country and Services are lighter, mostly-static templates. This spec has been updated to match; anything from the original draft that's out of scope is listed under **§4.5 Deferred / Not in Current Scope** so it's easy to add later without a restructure.
>
> **Also updated in this revision:** hosting moved from Vercel to a client-provided **Hostinger VPS** (§1, §2, §10 — the one piece needing real re-engineering, since ISR/caching was originally Vercel-native), domain confirmed as **Namecheap** with Cloudflare still handling DNS/CDN (§1, §10), a plain-language explainer on **Payload CMS's customizability** for whoever isn't familiar with it (§5.1), a new **SEO/AEO/GEO + Google Search Console** section (§8), monitoring narrowed to **free-tier tools** now that GSC covers performance reporting (§7), and a **mobile "app-like" UX** subsection covering touch UI and PWA setup (§6.4).

---

## 1. Tech Stack Overview

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)**, TypeScript | SSG/ISR, type safety, runs fine on a self-managed Node server (not Vercel-exclusive) |
| Hosting | **Hostinger** (VPS plan, not shared hosting — Next.js needs a Node process) | Client-provided; Node app run via **PM2** behind **Nginx** as reverse proxy |
| Database | **Neon (Postgres)** | Serverless Postgres, branching, generous free tier — works over the internet from any host, not tied to Vercel |
| ORM | **Prisma** | Safer migrations, strong TypeScript integration |
| CMS / Admin | **Payload CMS** (self-hosted, runs on Neon Postgres) | Open-source (MIT), fully in your own code — see §5.1 for what "customizable" means in practice |
| Storage | **Cloudflare R2** (S3-compatible) | No egress fees; independent of hosting provider |
| DNS / Security | **Cloudflare** (free plan) | DNS, WAF, Turnstile captcha, CDN/caching in front of the Hostinger VPS |
| Auth | **Auth.js (NextAuth)** or Payload's built-in auth | Don't hand-roll auth |
| Forms | **react-hook-form + zod** | Client + server-side validation from one schema |
| Email | **Resend** | Lead notifications, confirmation emails |
| Rich text | **Tiptap** (via Payload) | Testimonial/news body editing |
| SEO / Search | **Google Search Console** + `next-sitemap` + JSON-LD structured data | Indexing, Core Web Vitals reporting, rich results — see §8 |
| Monitoring | **Sentry** (free tier) + **UptimeRobot** (free tier) | Error tracking + uptime alerts, both free at this scale — see §7 |
| Mobile / App-feel | **PWA** (manifest + service worker via `next-pwa`/Serwist) | Installable, offline-tolerant, app-like on touch devices — see §6.4 |
| Component library | **shadcn/ui** (built on **Radix UI** primitives) | Own the code (not a black-box package), Tailwind-based, only ship what you use |
| Icons | **lucide-react** | Matches shadcn's defaults, tree-shakeable, consistent stroke style |
| Domain | `.com` via **Namecheap**, nameservers pointed to Cloudflare | Client already owns this; Cloudflare still handles DNS/CDN/WAF on top |

---

## 2. Architecture Diagram (conceptual)

```
Visitor ──▶ Cloudflare (DNS, WAF, Turnstile, CDN cache) ──▶ Nginx (Hostinger VPS)
                                                              │            │
                                                              │            ▼
                                                              │     Next.js (PM2, port 3000)
                                                              │            │
                                                              │            ├──▶ Neon Postgres (via Prisma / Payload)
                                                              │            ├──▶ Cloudflare R2 (images, PDFs)
                                                              │            └──▶ Resend (transactional email)
                                                              │
                                                              └──▶ serves cached static/ISR pages directly at the edge
                                                                   when possible, falls through to origin on miss

Admin (Client) ──▶ /admin (Payload panel, auth-protected) ──▶ Neon Postgres
                                                              └──▶ triggers revalidatePath() on save (Next.js
                                                                   regenerates the page on the VPS, Cloudflare
                                                                   cache purged for that URL via API/cache-tag)
```

**Key difference from a Vercel setup:** there's no built-in global edge network doing the ISR regeneration — that work happens on the single Hostinger VPS. Cloudflare sits in front purely as CDN/cache/WAF. This is still fast for a 3-page-template site (light compute, mostly static output), but on-demand revalidation needs to explicitly purge the Cloudflare cache for that path too (not just regenerate the file on the VPS), or visitors could see a stale cached copy until the CDN TTL expires. **This is the one piece of the original Vercel-native design that genuinely needs re-engineering — flag it to the client as the main technical trade-off of the Hostinger move.**

**Key principle (unchanged):** public pages are generated once and served from cache wherever possible; only the admin panel and form submissions touch the database live.

### 2.1 Should the backend be separated from the frontend?
Worth deciding deliberately rather than defaulting either way — here's the trade-off for this specific project:

**Keep it together (current recommendation, one Next.js + embedded Payload app on the VPS):**
- One Node process, one PM2 entry, one deploy — the least moving parts for a solo dev on a single VPS
- This is the whole point of choosing Payload 3.0 over something like Strapi (§5.1) — it's built to run *inside* Next.js, not beside it
- No CORS configuration, no keeping two codebases/deploys in sync, no second service that can go down independently
- Genuinely fine at this scale: 3 page templates, one admin, one site consuming the data

**Separate it (a standalone Payload/API service, frontend calls it over HTTP) — worth doing if:**
- You expect a second consumer of the same content later — e.g. a future native mobile app, or a partner site pulling the same university/country data
- You want to scale or restart the CMS independently of the public site (e.g. heavy admin usage shouldn't risk visitor-facing uptime)
- A different person/team will own backend vs. frontend work going forward, and a clean API boundary makes that division easier
- You outgrow the single VPS and want the CMS on its own box

**For this project as scoped:** none of those triggers apply yet (single dev, single site, single VPS, 3 templates). Recommendation is to **keep the monolith** and revisit only if one of the bullets above becomes real — splitting later is a refactor, not a rebuild, since Payload's collections/config don't change either way.

---

## 3. Content Model (Payload Collections / Prisma Schema)

Trimmed to what the 3 templates actually need — every field below maps directly to a section in the sketches.

| Collection | Key fields | Powers |
|---|---|---|
| `HomepageSettings` (singleton) | hero title/subtitle/image, About Us body, **Academic Guidance** items ×3 (Counselling, Selection of University & Program, University Admission/Enrollment — icon + short text each), **How GAP Works** steps (Consultation → Apply → Globe (center) → Appointment → Fly, each with label + icon), CTA button text/link | Home page |
| `Countries` | slug, name, hero image, body content, related universities | Country page (`/country/[slug]`) |
| `Universities` | name, country (relation), city, logo (image), description, is featured (drives the "Our Partners" marquee) | Home (partners marquee) + Country page |
| `Services` | title, icon, short description | Services page — one repeatable block/card rendered per entry, same layout each time (the "copy paste" pattern from the sketch) |
| `Testimonials` | student name, university (relation), quote, rating, photo | Home — "What Our Clients Say" (client called this "a blog where we can put feedback from clients," so it's editable exactly like a blog entry: add/edit/reorder from admin) |
| `News` | title, cover image, short blurb, published date, published/draft status | Home — "News Feed" (latest 6 shown as cards; no separate article page in this scope — see §4.5) |
| `Leads` | name, email, phone, interested country, message, source page, created at, **`emailVerified` (boolean), `verificationToken`, `verifiedAt`** (read-only in admin, exportable, filterable by verified status) | Captured via a shared "Apply Now" CTA + modal form (see §4.1), not a dedicated page |
| `SiteSettings` (singleton) | address(es), phone numbers, social links, footer content | Footer, shown on all 3 templates |

Each collection with images stores only the **R2 URL** — never the binary — in Postgres.

Dropped from the earlier draft (not in the sketches, see §4.5): `Courses`, `Events`.

---

## 4. Sitemap (updated from client sketches — 3 page templates)

### 4.1 Home (`/`)
Section order taken straight from the sketch pages:

1. Hero
2. About Us
3. Academic Guidance — 3 items: Counselling, Selection of University & Program, University Admission/Enrollment
4. How GAP Works — circular diagram: Consultation → Apply → Globe (center) → Appointment → Fly (editable step text/icons, illustration built as SVG so it's crisp at any size)
5. What Our Clients Say — testimonials, managed like blog entries per the client's note
6. News Feed — 6 cards, latest `News` entries (no click-through article page in this scope; a card can expand in place via an accordion/dialog if the client wants more than a blurb, cheaper than a new route)
7. Our Partners — university logo marquee, auto-scrolling ("Moving" in the sketch)
8. Address / footer (`SiteSettings`)

A persistent **"Apply Now" CTA** (header + a couple of in-page placements) opens a modal with the lead form (react-hook-form + zod + Turnstile) rather than routing to a dedicated page — keeps the lead-capture flow without adding a 4th page template. *(Enhancement — flag this pattern to the client since it wasn't explicit in the sketch, easy to swap for a full page later.)*

### 4.2 Country page (`/country/[slug]`)
Australia, Canada, New Zealand at launch (room to add UK, USA, Malaysia later without any code change — just new `Countries` entries). Static generation via `generateStaticParams`. Pulls related universities for that country.

### 4.3 Services page (`/services`)
One page, one repeatable block layout rendered once per `Services` entry — literally the "copy paste" pattern from the sketch: same card/section design, different title/icon/description each time. Fully static.

### 4.4 System / Utility Pages
These aren't content templates (don't count against the "3 pages" content scope in §4 — they're plumbing every site needs, not client-editable pages):
- **404 Not Found** (`not-found.tsx`) — branded, with a way back to Home/Country/Services, not the default Next.js placeholder
- **Error boundary** (`error.tsx`) — catches unhandled render errors, shows a friendly "something went wrong" screen instead of a blank page, logs to Sentry
- **Maintenance mode** — a `SiteSettings.maintenanceMode` toggle (boolean) in Payload; when on, Next.js middleware redirects all public traffic to a static maintenance page while `/admin` stays reachable so the client/dev can turn it back off. Lets the client take the site down for planned work without a developer touching code or DNS.
- **Offline / no-internet page** — since §6.4 already adds a PWA service worker, add a minimal offline fallback (`offline.html` or an app-router equivalent) the service worker serves when a visitor loses connection mid-browse, instead of the browser's default dinosaur/error screen
- **Loading states** (`loading.tsx` per route) — skeleton/spinner shown during navigation, standard Next.js App Router convention, cheap to add and improves perceived speed on the VPS setup where there's no edge pre-render to mask latency

### 4.5 Deferred / Not in Current Scope
Kept out to match the 3-page sketch, but the data model doesn't block adding these later:
- Dedicated **Blog/News article pages** (`/blog/[slug]`) — News currently lives only as homepage cards
- **Events** page/collection
- **Institute/University directory** and **Course listing** pages
- Standalone **About**, **Apply Now**, **Contact**, **Privacy Policy** pages (About is folded into Home; Apply Now is the modal in §4.1; Contact info lives in the footer)

---

## 5. Admin Panel & Content Management

### 5.1 About Payload CMS ("is it actually customizable?")
Yes — and it's worth being precise about what that means, since it's unfamiliar:
- **Open-source (MIT license), self-hosted.** No vendor, no monthly SaaS fee, no black-box hosted admin. The entire admin UI is generated from config files that live in your own repo.
- **Every collection, field, and validation rule** (the tables in §3) is defined in plain TypeScript in `/payload/collections`. Renaming a field, adding a new content type, changing what's required — all normal code edits, not "contact support."
- **Payload 3.0 runs embedded inside the Next.js app itself** (same process, same repo) rather than as a separate CMS server. That's a real advantage for the Hostinger VPS move: one Node process (managed by PM2) serves both the public site and `/admin`, instead of running and maintaining two separate services.
- Trade-off to be upfront about: it does have a learning curve if you haven't used it before (config-driven rather than click-driven like WordPress). The docs are solid and it's widely used, but budget some ramp-up time before committing to it as the CMS of record. If that ramp-up is a blocker, **Strapi** is the common alternative (also free/self-hosted, larger tutorial base) but runs as a *separate* service from Next.js — more moving parts to host and keep in sync on a single VPS.

### 5.2 Admin login
Yes — `/admin` is behind a real login, not open access. Payload provides this out of the box, so it isn't a page to design/build separately:
- Email + password login screen at `/admin/login`, generated by Payload itself (styleable, but functionally ready-made — no custom auth UI to build)
- Sessions via HTTP-only cookies (Payload's built-in auth), not something hand-rolled
- **Role-based access**: `admin` (full access, including managing other users/roles) vs `editor` (can edit content collections, can't touch system settings) — set per user in the `Users` collection
- Password reset flow included (email via Resend)
- Recommend turning on **2FA** for the admin role at minimum, given this account can edit everything on the live site — Payload supports this via a plugin; worth including at build time rather than bolting on later
- `/admin` should also sit behind Cloudflare (rate limiting on login attempts) since it's a public URL path even though it's auth-gated

**Requirement:** client edits text/images from the frontend → site updates live, no developer involved.

**How it works:**
1. Client logs into `/admin` (Payload, auth-protected, role-based: admin/editor).
2. Edits a field (text, image upload, reorder) → saved to Neon Postgres; new images uploaded directly to Cloudflare R2.
3. On save/publish, an **on-demand ISR revalidation** (`revalidatePath()` / `revalidateTag()`) is triggered for the affected page(s) via a Payload afterChange hook calling a Next.js revalidation API route, running on the Hostinger VPS.
4. The same hook also purges that path from the Cloudflare cache (via Cloudflare's API) so visitors don't see a stale CDN copy — live within seconds either way.

**Result:** static-page speed *and* instant editability — no conflict between "fast" and "editable."

**Editable by client:**
- All homepage sections — hero, About Us, Academic Guidance items, How GAP Works steps, testimonials ("What our clients say"), news feed cards, partner logo marquee
- Country page content (per-country hero, body, related universities)
- Services page entries (title/icon/description, in the reused card layout)
- Universities directory (feeds both the partner marquee and country pages)
- Footer / site settings (address, phone, social links)
- Leads are view-only (exportable, not editable), with verification status shown per lead (see §7.6) — to preserve data integrity

---

## 6. Design System

### Typography — confirmed
```css
--font-family-display: "Fraunces", ui-serif, Georgia, serif;
--font-family-body: "Manrope", ui-sans-serif, system-ui, sans-serif;
```
Good pairing, keeping it: **Fraunces** is a soft/wonky-optical-size serif with real character for headings and the "How GAP Works" / hero moments — it reads warm and personable rather than generic-corporate, which fits a consultancy that's ultimately selling trust in a person-to-person counselling relationship, not just a service catalogue. **Manrope** is a clean geometric sans that stays highly legible at body sizes and doesn't fight the serif for attention. Together they give the site more identity than an Inter-everywhere default while still landing inside the "clean, trust-focused" brief in the Color system below.
- Both are on Google Fonts → load via **`next/font/google`** (self-hosted at build time, zero external font requests at runtime)
- Fraunces ships as a **variable font** with an `opsz` (optical size) axis — use the variable weight file rather than pulling in multiple static weights, keeps payload down while still getting the full range from body-adjacent to big display sizes
- Limit to the 2 families above, 3–4 static weights total if not using the variable file, to keep font payload small

### Color system
- Define as CSS variables / Tailwind theme tokens, not hardcoded hex values, so the client's brand colors can be swapped in one place
- Structure: `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--background`, `--foreground`, plus `--border`, `--ring`
- Maintain WCAG AA contrast for text on backgrounds (important for a trust-driven consultancy site)
- Keep a neutral base (whites/grays) with one strong brand accent color — matches the clean, trust-focused look of consultancy sites like csbbd.com

### Component library
- **shadcn/ui** — copy components into the codebase (not an installed dependency), Tailwind-based, fully customizable, no unused JS shipped
- Confirming: shadcn/ui components are built **on top of Radix UI primitives** (`@radix-ui/react-*`) for accessibility/behavior, then styled with Tailwind — so choosing shadcn *is* choosing Radix underneath, not instead of it. You get Radix's unstyled, accessible primitives (focus management, keyboard nav, ARIA) plus shadcn's styling layer on top, all copied into your own codebase where it's fully editable — nothing here is a black box.
- **Icons: lucide-react** — matches shadcn's defaults exactly (shadcn components are pre-wired to expect Lucide icons), tree-shakeable so only imported icons ship, consistent stroke-based style across the whole site (Academic Guidance items, How GAP Works steps, service cards, bottom nav)
- Use for: buttons, forms, dialogs/modals, cards, navigation menu, tabs, accordion (FAQ), toast notifications (form submission feedback)

### 6.4 Mobile — this is the priority: app, not a responsive website
Flagging this as the most important UX requirement per the client, not an afterthought bolted onto desktop layouts. The build should start from an app-shell mental model on mobile, then scale *up* to desktop — not the other way around:
- **Bottom tab/nav bar** on mobile (Home / Countries / Services / Apply) instead of a hamburger-only header — thumb-reachable, always visible, exactly how an app's tab bar behaves. The header pattern is a desktop-web convention; don't carry it to mobile just because it's familiar to build.
- **App-shell layout**: persistent bottom nav + top bar frame the content area, and only the content area changes between sections — closer to how a native app swaps screens inside a fixed chrome than how a website reloads a whole page
- **Route transitions feel like screen transitions**, not page loads — slide/fade between Home → Country → Services using Framer Motion (or the View Transitions API where supported), so moving through the site feels like navigating app screens, not clicking links
- **Touch targets ≥ 44×44px** everywhere (buttons, links, form fields, bottom nav icons) — no fine-pointer-sized tap zones
- **Gesture-driven, not click-driven** — swipeable carousels (testimonials, news feed, partner marquee) via touch-drag, not arrow-button-only; consider a subtle scale/opacity tap feedback on interactive elements (the kind of microinteraction that makes a tap feel "acknowledged" the way native controls do)
- **Respect device chrome** — `env(safe-area-inset-*)` CSS so content and the bottom nav don't collide with the home-indicator/notch on iOS, and set `viewport-fit=cover` in the viewport meta
- **Floating/sticky "Apply Now" action**, always reachable without scrolling back up — the equivalent of a primary FAB/action button in a native app
- **PWA setup** — `manifest.json` (app name, icons, theme color, `display: "standalone"`) + service worker (`next-pwa`/Serwist) for offline-tolerant asset caching and an install prompt. Standalone display mode is what actually strips the browser chrome (address bar, back/forward buttons) when launched from the home screen — without it, no amount of in-page styling will stop it looking like a website in a browser tab.
- No native app store deliverable here — this is a PWA + app-shell UX approach within the one Next.js codebase, not a separate React Native/Flutter build. Worth a quick confirmation with the client that this matches what they mean by "like an app" (feel and navigation model) rather than an App Store listing, since the latter would be a separate project entirely.

### 6.5 Motion, transitions & micro-interactions
This is what actually sells the "app, not a website" feeling on top of the layout choices above — motion is what a screenshot can't show. Concrete inventory, all driven by **Framer Motion** for anything JS-orchestrated and plain CSS `transition`/`@keyframes` for simple state changes (cheaper, no JS needed):

- **Screen transitions**: Home → Country → Services slide/cross-fade (200–250ms, ease-out) instead of a hard reload feel — even though these are real Next.js routes under the hood, the transition should read as "the app changed screens," not "the browser navigated"
- **Scroll-reveal**: homepage sections (Academic Guidance, How GAP Works, testimonials, news feed) fade/slide up into view as the visitor scrolls, via `IntersectionObserver` — subtle (150–300ms), not bouncy, and **must respect `prefers-reduced-motion: reduce`** by skipping straight to the final state for anyone with that setting on
- **Tap/press feedback**: every button, card, and nav icon gets a `scale(0.97)` active-state on tap (mobile) / press (desktop mouse-down) — near-instant (80–100ms), this is the single biggest thing that makes taps feel "acknowledged" the way native iOS/Android controls do, and it's cheap (pure CSS)
- **Bottom nav active state**: a small accent-colored indicator (dot or underline) slides between tabs when switching, rather than just snapping the icon color — mirrors how native tab bars animate the selected state
- **Carousel/swipe momentum**: testimonials, news feed, country chips, and partner marquee use `scroll-snap` with native momentum scrolling (`-webkit-overflow-scrolling: touch`) rather than a JS-animated drag — smoother and cheaper than reimplementing physics
- **Skeleton loading states**: while a route or ISR-regenerated page is loading, show shimmering placeholder blocks (matching each section's real layout — card-shaped skeletons for News Feed, line-shaped for text) via `loading.tsx` (§4.4) rather than a blank screen or generic spinner — this is what makes a brief load feel like an app "thinking" rather than the page being broken
- **Form/toast feedback**: Apply Now submission success uses the shadcn/ui toast (slide-in from top or bottom, auto-dismiss) rather than a static "thank you" text swap — same for the email-verification-sent confirmation (§7.6)
- **Partner logo marquee**: continuous, slow (~30–40s per loop), linear CSS `@keyframes` translate — no easing curve, since a marquee that speeds up/down reads as glitchy rather than smooth
- **Hairline separation, not shadows**: per the design system's flat aesthetic, motion carries the "liveliness" instead of drop-shadows/gradients — cards lift with a 1–2px `translateY` + subtle border-color shift on hover (desktop) rather than a shadow, keeping the clean/flat look while still feeling responsive to interaction
- **Accessibility floor**: every animation above must have a reduced-motion fallback (instant state change, no transition) behind `@media (prefers-reduced-motion: reduce)` — non-negotiable, not optional polish

---

## 7. Performance & "Super Fast" Checklist

### Rendering
- [ ] Static Generation + ISR for all content pages (`revalidate` + on-demand revalidation on admin save)
- [ ] Only Apply Now form submission and admin panel are dynamic/server-rendered
- [ ] Use `generateStaticParams` for the Country dynamic route (Services is a single static route, no params needed)

### Images
- [ ] `next/image` everywhere — responsive `sizes`, lazy loading, WebP/AVIF
- [ ] Serve from Cloudflare R2 with a `next/image` custom loader (or Cloudinary transformations)
- [ ] Compress/convert images at upload time in the admin panel (auto WebP conversion)
- [ ] Explicit `width`/`height` on every image to prevent layout shift (CLS)
- [ ] Logos as SVG where possible (partner logo marquee)

### Database
- [ ] Indexes on `slug`, `country`, `published_at`, `featured` columns
- [ ] Prisma `select` — fetch only needed fields, never `SELECT *`
- [ ] No N+1 queries — use relational `include`/joins, batch fetches
- [ ] Use `@neondatabase/serverless` HTTP driver for edge/serverless functions

### Caching / CDN (Cloudflare in front of Hostinger)
- [ ] Cache Rules with long TTLs for static assets (images, fonts, JS/CSS)
- [ ] Brotli compression enabled
- [ ] On-demand revalidation also purges the matching Cloudflare cache entry (see §5), not just the origin — otherwise visitors can see stale content until TTL expiry
- [ ] Nginx configured with gzip/Brotli + sane keep-alive settings in front of the Node process (PM2)

### JavaScript / bundle size
- [ ] shadcn/ui — only ship components actually used, no full UI kit import
- [ ] Code-split by route (Next.js does this automatically — don't fight it with unnecessary `"use client"` at high levels)
- [ ] Minimize third-party scripts (Analytics, Pixel, chat widgets) — load with `next/script` `strategy="lazyOnload"` or `"worker"`
- [ ] Audit bundle size regularly (`next build` output / `@next/bundle-analyzer`)
- [ ] Avoid heavy date/utility libraries when a native or lightweight alternative exists

### Avoiding unnecessary calls
- [ ] No client-side fetching for content that could be statically rendered at build/revalidation time
- [ ] Debounce/guard any search or filter inputs that hit the database
- [ ] Cache repeated external API calls (if any) at the edge or with short-TTL revalidation
- [ ] Batch admin panel saves — don't fire a network request per keystroke

### Validation (forms & data integrity)
- [ ] Single `zod` schema shared between client (`react-hook-form`) and server (API route/Server Action) — validate once, trust nowhere else
- [ ] Server-side validation is mandatory even if client-side passes (never trust client input)
- [ ] Cloudflare Turnstile on all public-facing forms (Apply Now, Contact) to block spam/bots
- [ ] Sanitize rich-text input before rendering (Payload/Tiptap output) to prevent XSS
- [ ] Rate-limit form submission endpoints (Nginx `limit_req` or Cloudflare rate limiting rules)

### 7.6 Lead email verification — keeping the database honest
Good instinct — Turnstile stops bots, but it doesn't stop a real person typing `asdf@asdf.com` to get past a required field. Two layers, deliberately not one:

**Layer 1 — instant, at submission (blocks obvious junk, no email round-trip):**
- [ ] `zod` format validation (already in place) plus a server-side **MX record lookup** on the email's domain (a fast DNS check confirming the domain can actually receive mail) — rejects `test@asdf`, typo'd domains, and clearly fake addresses *before* anything is written to the database. This alone stops most low-effort junk.

**Layer 2 — confirmation, after submission (flags genuine-but-unconfirmed leads, doesn't block the lead):**
- [ ] The lead is still saved immediately with `emailVerified: false` — **don't gate the submission on verification**, or you lose real students who bounce before clicking a link, and the counselling team loses the ability to follow up by phone in the meantime
- [ ] Resend sends a confirmation email with a one-click verification link (`verificationToken`) right after submission
- [ ] Clicking it sets `emailVerified: true` and `verifiedAt` — the admin Leads view can filter/sort by this, so the team can prioritize confirmed leads without losing the unconfirmed ones entirely
- [ ] Optional cleanup: a scheduled job (cron on the VPS, or a Payload scheduled task) auto-archives leads that stay unverified past a set window (e.g. 30 days) — keeps long-term database weight down without deleting anything in the first few days when a callback might still convert it
- [ ] This same verification email can double as the "thanks for applying, here's what happens next" confirmation the client already needs to send — one email, two jobs

### Monitoring & reliability (all free-tier at this scale)
- [ ] **Sentry** free tier (5k errors/month) for error tracking — know about bugs before the client does
- [ ] **UptimeRobot** free tier (50 monitors, 5-min checks) for uptime alerts on the Hostinger VPS
- [ ] **Google Search Console** — Core Web Vitals / page-experience report covers real-user performance data without needing Vercel Speed Insights (see §8.4)
- [ ] Ad-hoc performance checks via **PageSpeed Insights** / Lighthouse CI in the deploy pipeline
- [ ] PM2 process monitoring (`pm2 monit`, auto-restart on crash) on the VPS itself
- [ ] Neon point-in-time restore + nightly automated export to R2 as a second backup

### Targets
- Lighthouse Performance: **90+**
- LCP: **< 2.5s** (ideally < 1.5s)
- CLS: **< 0.1**
- INP: **< 200ms**

---

## 8. SEO, AEO & GEO

Three related but distinct goals: **SEO** (rank in Google/Bing search), **AEO** (get cited/answered correctly by answer engines like Google's AI Overviews, Bing Copilot), **GEO** (get cited by generative engines/LLMs like ChatGPT, Perplexity, Claude when they browse or are trained on the web). They share a foundation — clean structure, fast pages, crawlable content — with a few extras on top for the AI-facing half.

### 8.1 Technical SEO foundation
- [ ] `next-sitemap` (or a hand-rolled route handler) generating `/sitemap.xml`, auto-including all `Countries` slugs
- [ ] `/robots.txt` — allow all major crawlers, point to the sitemap
- [ ] Per-page `<title>` / meta description via Next.js Metadata API, editable from Payload per Country/Service entry (not hardcoded)
- [ ] Canonical URLs on every page (avoids duplicate-content issues from any trailing-slash/www variants)
- [ ] Open Graph + Twitter Card meta tags (title, description, image) for share previews
- [ ] Semantic HTML — proper heading hierarchy (one `h1` per page), landmark elements — this also directly helps AEO/GEO parsing

### 8.2 Structured data (schema.org / JSON-LD)
- [ ] `EducationalOrganization` schema on Home (name, logo, address, sameAs social links)
- [ ] `Review`/`AggregateRating` schema on testimonials — genuinely eligible for rich results given real student reviews
- [ ] `BreadcrumbList` on Country and Services pages
- [ ] `FAQPage` schema if an FAQ section is added to Services (also a strong AEO signal — FAQ-structured content is what answer engines pull from most reliably)

### 8.3 AEO / GEO — being the source AI answers cite
- [ ] Write content in direct, quotable, self-contained chunks (a clear question-style subheading followed by a concise answer paragraph) — this is what gets lifted into AI Overviews and chatbot answers
- [ ] `llms.txt` at the root — an emerging convention giving LLM crawlers a plain-text summary of what the site is and where key content lives (low cost to add, no downside)
- [ ] Keep key facts (countries served, services offered, partner universities) in real text in the HTML, not only inside images/SVG or client-rendered-only components — crawlers and AI systems need to read it directly
- [ ] Consistent NAP (name/address/phone) across the site and any external listings — matters for local/consultancy trust signals both classic SEO and AI answers draw on
- [ ] Since the 3 templates are mostly static (§7), pages are already fast and fully server-rendered HTML at request time — a genuine advantage for both crawler and LLM-fetcher access, no client-side-only content to miss

### 8.4 Google Search Console setup
- [ ] Verify property (DNS TXT record via Cloudflare, or HTML meta tag — DNS is preferable since it isn't tied to any one page)
- [ ] Submit `sitemap.xml`
- [ ] Set preferred domain / check both `www` and non-`www` aren't indexed as duplicates
- [ ] Monitor **Core Web Vitals** and **Page Experience** reports post-launch — this is the free replacement for Vercel Speed Insights referenced in §7
- [ ] Check **Coverage** report a week after launch to confirm all 3 templates + all Country slugs are indexed, no unexpected `noindex`/crawl errors
- [ ] (Optional, cheap to add) Bing Webmaster Tools — powers Bing/Copilot indexing too, same sitemap

---

## 9. Project Structure (suggested)

```
/app
  /(marketing)
    /page.tsx                 → Home (Hero, About, Academic Guidance, How GAP Works,
                                        Testimonials, News Feed, Partner Marquee, Footer)
    /country/[slug]/page.tsx  → Country template (Australia, Canada, New Zealand, ...)
    /services/page.tsx        → Services template (repeated boilerplate block per entry)
  /admin                       → Payload CMS mount
  /api
    /leads/route.ts            → form submission handler (used by the Apply Now modal)
    /revalidate/route.ts       → on-demand ISR trigger + Cloudflare cache purge (called by Payload hooks)
  /sitemap.ts                  → next-sitemap / dynamic sitemap route
  /robots.ts                   → robots.txt route
  not-found.tsx                 → branded 404 (§4.4)
  error.tsx                     → error boundary (§4.4)
  loading.tsx                   → default loading/skeleton state (§4.4, per-route overrides as needed)
  /maintenance/page.tsx         → static maintenance page, served via middleware when toggled on (§4.4)
middleware.ts                   → checks SiteSettings.maintenanceMode, redirects to /maintenance when on
/components
  /ui                          → shadcn/ui components (incl. ApplyNowDialog)
  /sections                    → Hero, AboutUs, AcademicGuidance, HowGapWorks,
                                  Testimonials, NewsFeed, PartnerMarquee
/lib
  /prisma.ts                   → Prisma client singleton
  /validations                 → zod schemas (shared client/server)
  /r2.ts                       → Cloudflare R2 upload helpers
/payload
  /collections                 → Payload collection configs (see §3)
  /payload.config.ts
/public
  /fonts                       → self-hosted font files (if not using next/font/google)
  /manifest.json                → PWA manifest (name, icons, theme color, standalone mode)
  /offline.html                 → offline fallback served by the service worker (§4.4, §6.4)
  /llms.txt                     → plain-text site summary for LLM crawlers (see §8.3)
/styles
  /globals.css                 → Tailwind + CSS variable theme tokens
ecosystem.config.js             → PM2 process config for the Hostinger VPS
```

Note the flatter route tree vs. the original draft — no `/institute`, `/course`, `/blog`, `/event`, `/about`, `/apply-now`, `/contact` routes, matching the 3-template scope in §4.

---

## 10. Deployment Flow

1. Domain already owned via **Namecheap** → nameservers pointed to **Cloudflare** (free plan) so Cloudflare can handle DNS/CDN/WAF/Turnstile in front of the origin
2. **Hostinger VPS** provisioned by the client → Node.js, PM2, and Nginx installed; repo deployed to the VPS (via CI/CD — e.g. GitHub Actions SSH deploy — or manual `git pull` + `pm2 restart` initially)
3. Nginx configured as reverse proxy (port 80/443 → Next.js on `localhost:3000`), SSL via Let's Encrypt/Certbot (or Cloudflare "Full (strict)" mode with a Cloudflare origin certificate)
4. Cloudflare A/AAAA record → Hostinger VPS IP, proxied (orange-cloud) for CDN/WAF
5. Neon project created → `DATABASE_URL` added to the VPS `.env`
6. Cloudflare R2 bucket created → API keys added to the VPS `.env`
7. Payload CMS configured against Neon Postgres, mounted at `/admin` (runs embedded in the same Next.js/PM2 process — see §5.1)
8. Resend, Sentry, Turnstile keys added to `.env`
9. Staging: a Neon branch + a separate PM2 process/subdomain (e.g. `staging.domain.com`) on the same VPS, or a second small VPS if the client wants full isolation
10. Google Search Console + sitemap submission (§8.4), Sentry + UptimeRobot monitoring (§7) all configured **before** launch, not after

### 10.1 Temporary Vercel hosting for client demos
Yes, that's fine and a reasonable thing to do — a few practical notes:
- **The codebase doesn't need to change.** Next.js + Payload + Neon all work on Vercel out of the box; this is exactly the stack the original draft assumed, so a Vercel deploy is actually the *lower-friction* path while the VPS/Nginx/PM2 setup is still being put together.
- **Use Vercel's own `*.vercel.app` URL (or a throwaway subdomain), not the real domain**, for the demo. Don't point the live Namecheap/Cloudflare DNS at Vercel temporarily — re-pointing DNS back and forth risks SSL/propagation hiccups and is unnecessary since a `.vercel.app` link works fine for a client walkthrough.
- **Point it at the same Neon database** (or better, a **Neon branch**) so the client is reviewing real content, not a second disconnected dataset they'd have to re-enter later. A branch also means nothing they add during the demo gets lost or conflicts with production data.
- **R2 and Resend work identically from Vercel**, no changes needed there.
- Cloudflare's WAF/Turnstile won't be in front of the Vercel demo unless you also proxy that URL through Cloudflare — acceptable for an internal client review, just don't treat the demo URL as production-hardened.
- Once approved, cut over cleanly: deploy the same build to the Hostinger VPS, verify it, **then** switch Cloudflare's DNS to the VPS IP — and take the Vercel deployment down (or at least stop pointing anyone at it) so there's only ever one live copy of the site.

---

## 11. Ownership & Reputation Safeguards

- All service accounts (**Hostinger**, Neon, Cloudflare, **Namecheap**, Resend, **Google Search Console**) registered in the **client's name/company**, with developer added as collaborator/user — client is never locked out
- VPS root/SSH access documented and handed to the client (or their IT contact), not held solely by the developer
- Milestone-based payment tied to working demos, not just time
- Maintenance retainer offered post-launch for content help, bug fixes, small features — worth flagging that self-hosting on a VPS (vs. Vercel) shifts some ongoing ops (OS/security updates, SSL renewal, PM2/Nginx health) onto whoever holds this retainer, since there's no managed platform absorbing that
- Nightly backups independent of any single provider's dashboard
