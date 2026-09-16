# GAP --- Codex Handoff

## Purpose

This file transfers the working context for **GAP (Global Admission
Platform)** from the original ChatGPT development conversation to Codex.

**Do not rebuild the project from scratch.** Treat the existing
repository as the source of truth, preserve completed work, inspect the
implementation before changing it, and continue from the **verification
/ QA / bug-fix phase**.

The planned product-development roadmap contained **15 stages and all 15
stages have been implemented**. There is no planned Stage 16 for GAP v1.
Remaining work is verification, fixing implementation/build issues,
environment setup, QA, and deployment preparation.

------------------------------------------------------------------------

## 1. Product

GAP is a modern study-abroad / global admissions platform.

Primary public experiences include:

-   Marketing homepage
-   Services
-   Study destinations / countries
-   University discovery
-   University detail pages
-   News / journal
-   Lead capture / Apply Now
-   Student application submission
-   Staff operations foundation
-   Payload CMS administration

The product should feel modern, polished, trustworthy, spacious,
responsive, and professional rather than like a generic template.

------------------------------------------------------------------------

## 2. Core technology

The current project uses:

-   Next.js App Router
-   React
-   TypeScript
-   Tailwind CSS **v4**
-   Payload CMS
-   PostgreSQL
-   `@payloadcms/db-postgres`
-   `@payloadcms/next`
-   `@payloadcms/richtext-lexical`
-   Radix UI for interactive primitives
-   shadcn-style reusable UI components
-   Lucide React
-   Zod
-   React Hook Form

### Critical dependency rule

**Keep Tailwind CSS v4. Do not downgrade the project to Tailwind 3.**

The Tailwind setup intentionally uses:

``` css
@import "tailwindcss";
```

and `@tailwindcss/postcss`.

Do not reintroduce an old Tailwind 3 configuration merely to work around
an error.

------------------------------------------------------------------------

## 3. UI / implementation rules

When modifying the existing project:

-   Preserve the established visual language unless fixing a clear
    problem.
-   Prefer reusable components over duplicated markup.
-   Use existing CSS variables and shared colors.
-   Use Radix/shadcn-style components for dialogs, buttons, popups, and
    similar primitives.
-   Maintain smooth but restrained transitions/animations.
-   Keep responsive behavior strong across desktop, tablet, and mobile.
-   Do not make typography unnecessarily small.
-   Preserve accessibility: labels, focus states, keyboard behavior,
    semantic HTML, reduced-motion behavior where relevant.
-   Avoid replacing working sections simply because a different
    implementation is possible.
-   Do not perform broad refactors during QA unless they solve a
    concrete issue.

------------------------------------------------------------------------

## 4. Existing major routes

Inspect the repository because exact files may evolve during QA, but the
implemented route set includes approximately:

``` text
/
 /services
 /country/[slug]
 /news
 /news/[slug]
 /universities
 /universities/[slug]
 /apply
 /staff
 /admin
 /api/...
```

Payload also has Next.js route boundaries for its admin/API integration.

------------------------------------------------------------------------

## 5. Public website work already completed

### Homepage

The homepage includes:

-   Hero
-   About
-   Academic guidance
-   GAP process / how it works
-   Testimonials
-   News feed
-   Partners / trust content
-   Final CTA
-   Apply Now entry points
-   Responsive navigation/footer/mobile navigation

Homepage CMS integration was added for news and testimonials, with
fallback behavior where appropriate.

### Services

`/services` is CMS-powered through Payload.

Service content supports ordered service records and falls back safely
when CMS content is unavailable during development.

### Countries

Dynamic route:

``` text
/country/[slug]
```

Initial destinations include:

-   Australia
-   Canada
-   New Zealand

Country pages are CMS-first and include static development fallbacks.

Country pages connect to relevant universities.

### News / Journal

Implemented:

``` text
/news
/news/[slug]
```

News supports:

-   Title
-   Slug
-   Cover image URL
-   Short blurb
-   Rich content
-   Published date
-   Draft/published status
-   SEO title
-   SEO description

Only published articles should appear publicly.

### Universities

Implemented:

``` text
/universities
/universities/[slug]
```

University records include:

-   Name
-   Slug
-   Country relationship
-   City
-   Logo URL
-   Website URL
-   Description
-   Highlights
-   Featured flag
-   Draft/published status
-   SEO title
-   SEO description

The university directory includes search and country filtering.

Country pages can show universities belonging to that destination.

------------------------------------------------------------------------

## 6. Lead capture

An Apply Now lead flow has been implemented.

Expected flow:

``` text
Apply Now form
→ client validation
→ POST API
→ server validation
→ Payload Lead record
→ success/error state
```

Lead records include operational fields added later, including:

-   Name
-   Email
-   Phone
-   Interested country
-   Message
-   Source page
-   Status
-   Assigned staff member
-   Follow-up date
-   Staff notes
-   Email verification foundation fields

Lead workflow statuses include concepts such as:

-   New
-   Contacted
-   Qualified
-   Application started
-   Not proceeding

Review the actual collection before changing status values.

------------------------------------------------------------------------

## 7. Student application journey

Implemented route:

``` text
/apply
```

The application flow captures study-abroad application information and
creates Payload application records.

Application records include concepts such as:

-   Unique reference
-   Student name
-   Email
-   Phone
-   Country relationship
-   University relationship
-   Study level
-   Intake
-   Message
-   Source page
-   Status
-   Assigned staff
-   Priority
-   Next action
-   Next-action date
-   Document requirements
-   Status history
-   Internal notes

Application workflow includes stages similar to:

``` text
Submitted
Profile review
Documents required
Ready to apply
Submitted to university
Offer received
Enrolled
Closed
```

Do not casually rename workflow values because API/data compatibility
may depend on them.

------------------------------------------------------------------------

## 8. Staff operations

Stage 13 introduced an operations dashboard foundation at:

``` text
/staff
```

It provides an overview of:

-   New leads
-   Active applications
-   Applications waiting for documents
-   Offers received
-   Recent applications
-   Recent leads

Payload Admin remains the primary record-management interface.

Stage 14 added/hardened authentication and authorization around staff
functionality. **Verify the actual implementation carefully before
assuming the route is secure.**

------------------------------------------------------------------------

## 9. Payload CMS

The Payload configuration is currently under the project's Payload area;
inspect the repository for the exact config path.

Collections developed during the project include:

-   Users
-   Countries
-   Universities
-   Services
-   Testimonials
-   News
-   Leads
-   Applications
-   Documents
-   Site settings

Potentially relevant helpers include:

``` text
lib/payload.ts
lib/cms-queries.ts
lib/admin-queries.ts
lib/env.ts
```

There are also CMS setup/workflow documentation files in the repository.

### Payload warning

Earlier stages were built without a successful full dependency
installation/build in the ChatGPT environment. Payload APIs are
version-sensitive.

Therefore:

**Verify the installed Payload version and current official API before
changing Payload route/admin integration.**

Do not assume an older Payload example is correct.

------------------------------------------------------------------------

## 10. Database and environment

The application is designed for PostgreSQL through Payload.

Important environment variables include at least:

``` env
DATABASE_URL=
PAYLOAD_SECRET=
```

Inspect `.env.example` and environment validation code for the complete
current list.

Rules:

-   Never commit real secrets.
-   Use a strong production `PAYLOAD_SECRET`.
-   Do not weaken production validation merely to make development
    errors disappear.
-   Keep server secrets out of client bundles.

------------------------------------------------------------------------

## 11. Documents and security

The final security stage introduced a private/restricted documents
foundation.

Important design decision:

**Do not expose passport, transcript, certificate, or other student
documents through an unauthenticated public upload endpoint.**

The intended security posture is:

-   authenticated/authorized document access
-   private storage in production
-   restrictive MIME/file policies
-   no-store/private responses where applicable
-   role-based access
-   preferably malware scanning before production public/student uploads

If student self-service uploads are added later, design authentication
and authorization first.

Do not turn the existing document foundation into an unrestricted public
file bucket.

------------------------------------------------------------------------

## 12. Roles / authorization

Payload users have staff roles such as:

-   Admin
-   Editor / staff equivalent

The final stages introduced tighter role-based permissions.

Before modifying authorization:

1.  Inspect `Users`.
2.  Inspect each collection's `access` rules.
3.  Inspect staff route protection.
4.  Test anonymous, normal staff, and admin behavior separately.

Never solve an authorization bug by making a sensitive collection
public.

------------------------------------------------------------------------

## 13. SEO / production foundation

The final stages added production-oriented pieces including:

-   Global metadata
-   Open Graph foundation
-   `robots.txt`
-   Dynamic sitemap
-   404 handling
-   Error states
-   Security headers
-   Loading states
-   Environment validation
-   QA/deployment documentation
-   Typecheck/verification scripts

Inspect these before adding duplicate implementations.

------------------------------------------------------------------------

## 14. Known verification limitation

This is the most important handoff detail.

During the original ChatGPT build process, dependency installation
repeatedly exceeded the execution time limit. Consequently, the final
project was packaged but **was not fully verified with a successful
local production build**.

Do not assume the repository is error-free merely because all roadmap
stages were implemented.

Your first job is to verify it.

------------------------------------------------------------------------

## 15. First Codex task

Start by inspecting, not editing.

Run or inspect:

``` bash
node --version
npm --version
npm install
npm run generate:types
npm run typecheck
npm run build
```

If scripts differ, inspect `package.json` and use the repository's
actual scripts.

Then fix issues **incrementally**.

For every error:

1.  Determine the root cause.
2.  Inspect affected files and package versions.
3.  Make the smallest correct fix.
4.  Re-run the failed command.
5.  Do not continue to unrelated refactors until it passes.

After build verification:

``` bash
npm run dev
```

and test the application.

------------------------------------------------------------------------

## 16. Critical QA flows

Verify at minimum:

### Public

-   Homepage renders
-   Header/footer/mobile navigation
-   Apply Now dialog opens and validates
-   Lead submission succeeds
-   `/services`
-   Country pages
-   Country → universities
-   `/universities`
-   University search
-   Country filter
-   University detail pages
-   `/news`
-   Published article pages
-   Invalid slugs return appropriate 404 behavior
-   `/apply`
-   Application validation/submission
-   Responsive layout
-   Keyboard navigation
-   Dialog focus behavior

### Payload

-   `/admin` loads
-   First admin/user setup works if database is empty
-   Admin authentication
-   Countries CRUD
-   Universities CRUD
-   Services CRUD
-   Testimonials CRUD
-   News draft/publish behavior
-   Leads visible to authorized staff
-   Applications visible/editable to authorized staff
-   Sensitive internal fields are not exposed publicly
-   Documents are restricted correctly

### Staff

-   Anonymous users cannot access protected staff operations
-   Authorized staff can access permitted functions
-   Admin-only operations remain admin-only
-   Metrics/query helpers work with real Payload data

------------------------------------------------------------------------

## 17. Responsive QA

Check at least:

``` text
1440px desktop
1024px laptop/tablet landscape
768px tablet
480px mobile
375px small mobile
```

Look specifically for:

-   horizontal overflow
-   clipped headings
-   navigation collisions
-   oversized hero typography
-   dialog overflow
-   form field width issues
-   card grids
-   university filters
-   news/article typography
-   admin/staff dashboard layout

Fix real problems without redesigning stable sections.

------------------------------------------------------------------------

## 18. Build completion definition

GAP v1 should only be called technically verified when all of the
following are true:

``` text
npm install                         PASS
Payload type generation             PASS
TypeScript/typecheck                 PASS
Next.js production build             PASS
Development server                   PASS
Payload Admin                        PASS
Lead submission                      PASS
Application submission               PASS
Authorization checks                 PASS
Critical public routes               PASS
Responsive smoke test                PASS
No obvious console/server errors      PASS
```

Deployment readiness additionally requires production environment
configuration, production database/storage, secrets, and deployment
smoke testing.

------------------------------------------------------------------------

## 19. How Codex should work on this repository

Preferred workflow:

``` text
Inspect
→ reproduce
→ patch
→ run check
→ confirm
→ move to next issue
```

Do not:

-   regenerate the whole project
-   create arbitrary new "stages"
-   downgrade Tailwind
-   remove Payload to simplify the build
-   replace CMS data with static data to hide DB issues
-   disable TypeScript errors broadly
-   use `any` everywhere to silence type errors
-   make sensitive endpoints public
-   remove security checks simply to get a successful response
-   redesign unrelated pages during bug fixing

When a workaround is unavoidable, explain it clearly and leave a concise
TODO.

------------------------------------------------------------------------

## 20. Package/version discipline

Before fixing dependency-related errors:

-   inspect `package.json`
-   inspect the lockfile if present
-   inspect installed versions
-   check whether Payload packages are version-compatible
-   prefer matching Payload ecosystem package versions
-   do not blindly upgrade every package at once

Because this project was developed over multiple iterations, some
generated code may target a slightly different Payload/Next API than the
installed package version. Correct the implementation to the actual
compatible API rather than masking errors.

------------------------------------------------------------------------

## 21. Source-of-truth priority

When information conflicts, use this priority:

1.  Current repository code and configuration
2.  Current installed dependency versions
3.  This handoff file
4.  Original development assumptions

This handoff describes intent and history. The repository determines
what actually exists.

------------------------------------------------------------------------

## 22. Current project status

Planned development:

``` text
Stage 1–15: COMPLETE
```

Current phase:

``` text
FINAL QA
BUILD VERIFICATION
BUG FIXING
ENVIRONMENT SETUP
DEPLOYMENT PREPARATION
```

There is no planned Stage 16 for GAP v1.

New feature work should be treated as post-v1 scope unless it is
required to satisfy an already implemented v1 flow.

------------------------------------------------------------------------

## 23. Expected Codex behavior

When you begin:

1.  Read this entire file.
2.  Inspect the repository tree.
3.  Inspect `package.json`, Next config, TypeScript config, Payload
    config, environment example, and core route structure.
4.  Summarize what you actually find.
5.  Run the verification sequence.
6.  Fix errors one by one.
7.  Keep a concise record of significant fixes.
8.  Do not claim success until the relevant command/test actually
    passes.

The immediate objective is **not more features**.

The immediate objective is:

> Make the existing GAP v1 repository install cleanly, generate Payload
> types, typecheck, build, run, and pass its critical end-to-end smoke
> tests without weakening the intended architecture or security model.
