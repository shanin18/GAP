# Deployment and handover

The hosting provider and domain are still undecided. This guide prepares the release without choosing infrastructure or changing the current database.

## Configuration

Copy `.env.example` into your local environment or the hosting provider's secret manager. Never commit real credentials. Set `NODE_ENV=production` for deployment commands.

- `APP_ENV=production`: set on the hosting account. Local `.env` uses `APP_ENV=local` so `npm run build` can be tested with a localhost origin before the domain is available. Do not deploy the local setting. `npm run env:check` always enforces production requirements.

- `DATABASE_URL`: PostgreSQL connection string. Use the provider's certificate-verified TLS connection. Use a direct connection for migrations where the provider requires it.
- `DATABASE_SCHEMA=gap`: required by the committed initial migration. It creates the schema on a fresh database. Do not change this independently after generating migrations.
- `PAYLOAD_SECRET`: unique random secret, at least 32 characters. Generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. Keep it stable across instances and deployments.
- `NEXT_PUBLIC_SITE_URL`: the final HTTPS origin, without a path. Set it before building; rebuild when changing the domain.
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT`: email transport. Port 465 uses implicit TLS; other ports use Nodemailer's SMTP negotiation.
- `EMAIL_FROM_ADDRESS`: a sender address authorized by the email provider.
- `NOTIFY_EMAIL`: comma-separated staff inboxes for enquiries and applications.
- `IMAGE_HOSTS`: comma-separated explicit external image hostnames used by published content. Local uploaded images do not need an entry. Wildcards and full URLs are rejected. An empty local value disables external image optimization; add the specific hosts used by your content to enable those images.
- `EMAIL_LOGO_URL`: optional publicly accessible logo; preferably PNG.
- `PAYLOAD_PUSH_SCHEMA=false`: always in production.

Run `npm run env:check` to validate production settings without connecting to services. It prints setting names, not credentials. A local localhost URL or placeholder configuration is expected to fail this production check. Successful validation does not prove database or SMTP connectivity.

SMTP transport verification is skipped while loading configuration so builds and migration generation do not wait on an email server. Actual email sends still authenticate with the configured transport; failed notifications are logged. Durable email retries are not implemented yet.

## Cloudinary uploads (Vercel and optional Hostinger storage)

Set these server environment variables in Vercel for each environment you deploy:

```dotenv
APP_ENV=production
UPLOAD_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_SITE_URL=https://your-deployment-domain
```

Keep secrets out of source control and never prefix them with `NEXT_PUBLIC_`. The API key needs asset creation/upload and destroy/delete permissions. A successful API ping alone does not prove upload permissions. Redeploy after changing environment variables.

Media images are public Cloudinary image assets. Documents use authenticated raw assets, including PDFs, and are streamed through Payload's existing authorized file endpoint. Signed Cloudinary document URLs are not returned to the browser or stored in records. Staff's assigned-application restrictions still apply to downloads. The app automatically allows `res.cloudinary.com` for image rendering while Cloudinary is enabled; `IMAGE_HOSTS` is optional and is only for additional external domains.

Uploads through Vercel are capped at **4 MB per file** to leave room for multipart data below its 4.5 MB request limit. Local/non-Vercel uploads retain the 10 MB limit. Do not upload larger private files locally if you need to test their delivery on Vercel. See [Vercel's documented limits](https://vercel.com/docs/functions/limitations).

Before switching an existing local project, run `npm run payload -- run scripts/migrate-cloudinary.ts` on the computer that holds `public/uploads` and `private-uploads`. This uploads existing assets to the configured external account, so confirm that account is authorized for those files. It preserves database IDs, existing file endpoints and local originals. It preflights missing local files before uploading; a failure can leave a partial cloud copy, and rerunning overwrites the same deterministic IDs. Do not rerun an old local backup after editing/replacing the corresponding Cloudinary assets.

The current QA-only command is `npm run payload -- run scripts/migrate-cloudinary.ts --demo-only`; it accepts only the four checksum-verified generated placeholder PNGs. After a successful migration, set `UPLOAD_STORAGE=cloudinary` locally, restart the development server and redeploy Vercel with the variables above. Existing hardcoded local `/uploads/` links, if any, must be replaced by Media URLs; `/api/media/file/` links remain supported.

No database schema migration is needed for this adapter. When moving to Hostinger, keep these variables to continue using Cloudinary. Switching back to local storage requires copying every cloud asset back into its collection's upload directory and updating any direct Cloudinary image links before removing the cloud service.

Verification: upload an image as admin; open it publicly; upload a document for an assigned application; confirm the assignee/admin can download it and an unrelated staff account or logged-out visitor cannot. Test replacing and deleting an upload. Automated adapter checks: `node --import tsx scripts/test-cloudinary.mjs`.

After migrating the seeded QA files, run `npm run payload -- run scripts/verify-cloudinary.ts` for a read-only live check of public delivery, private delivery, and Payload's download permissions. It requires the seeded application/document records and Cloudinary credentials; it does not create users or change records.

## Database migrations

Migrations and their schema snapshots are in `payload/migrations`. Commit both the migration TypeScript and snapshot JSON plus the generated index.

For each collection-schema change:

1. Make the collection changes locally.
2. Run `npm run cms:migrate:create -- descriptive_change_name`.
3. Review the generated SQL, especially dropped columns, constraints, and data conversions. Migration generation compares schema snapshots and does not apply the change to the database.
4. Apply the migration to a disposable database or restored copy before scheduling the production release.
5. Back up production, then run `npm run cms:migrate:status` and `npm run cms:migrate` once from a release process, before starting the new application version.

Do not run migrations concurrently from every web instance. Do not use `cms:sync`, `migrate:fresh`, `migrate:reset`, or automatic schema push on production data.

### First deployment to an empty database

Set the intended schema and production environment, then run the committed initial migration with `npm run cms:migrate`. `npm run cms:initialize` can then populate missing default content; in production it does not push the schema. Create the first administrator through Payload's initial-user setup before opening the site to the public.

### Existing database created by schema push

Do **not** apply the initial migration directly to the existing development database: its tables already exist. Do not mark it applied without checking schema equivalence.

The safest initial production rollout is a fresh database initialized by migrations, followed by a planned data transfer that preserves IDs and relationships. If preserving the current database is necessary, restore a backup into an isolated database and have the migration history baselined against the actual schema first. This project has not baselined or changed your existing database.

## Release sequence

1. Choose a supported Node runtime compatible with the lockfile and installed dependencies; use the same version for build and runtime.
2. Install exactly the lockfile dependencies with `npm ci`.
3. Configure production environment variables and run `npm run env:check`.
4. Take a database backup and snapshot uploaded files.
5. Apply pending migrations once, following the process above.
6. Run `npm run build`, then `npm start` behind the hosting provider's HTTPS proxy. The build may need database access to render public pages.
7. Configure the final domain, TLS, and email sender DNS records using the providers' instructions.

Keep application source, migration files, and the lockfile together as a versioned release. Do not deploy `.env`, development caches, or temporary benchmark files.

## Storage, backups, and rollback

Before launch, provision durable storage for `public/uploads` and `private-uploads`, or configure a storage adapter. Ephemeral filesystem storage will not preserve uploads through redeployments. Never expose `private-uploads` directly through a public static-file server; document downloads must retain Payload authentication.

Back up the database and both upload stores, with retention and a restore procedure chosen with the client. Verify a restore into an isolated environment before relying on the backups. Store secrets separately from public artifacts and restrict backup access because records include student information.

Keep the previous application release available. Roll back the application only if its database schema remains compatible. Prefer a corrective forward migration. Generated down migrations can drop tables or data; restoring a coordinated database-and-file backup is a planned recovery operation, not a routine deployment command.

## Decisions waiting for hosting

### Performance and Cloudflare CDN

Vercel already serves static assets and eligible public pages through its CDN. Adding Cloudflare requires a custom domain with Cloudflare proxying enabled; it cannot be attached to a `vercel.app` hostname. No live Cloudflare configuration has been applied by this repository.

Start with Cloudflare's normal static-file caching and respect origin Cache-Control headers. Do not enable a site-wide Cache Everything rule. Explicitly bypass `/admin`, `/admin/*`, `/api/*`, authenticated requests (including the `payload-token` cookie), non-GET/HEAD requests, and Next.js RSC requests. Preserve query strings, including `_rsc`, and leave `/_next/image` to the application's image cache. Never cache login, student document downloads, or Turnstile verification responses.

Public pages and CMS queries already use five-minute ISR/Data Cache with CMS save invalidation. An additional HTML edge cache needs coordinated purging when editors save; otherwise content can remain stale after an origin invalidation. Keep HTML caching with Vercel/Next until that purge integration is configured.

Place the application server close to the Neon database region. Database wake-up and server cold starts affect the first login/admin request; a CDN cannot remove that cost from private routes. For a Hostinger VPS, run a persistent production Node process behind the HTTPS reverse proxy rather than `next dev`. Use `npm ci --omit=dev` in the runtime release after building, and keep development/image preparation scripts out of the runtime deployment artifact.

Measure production response times separately from browser rendering and network latency. A warm localhost response is not a guarantee of a 50 ms page load for remote users.

- Persistent volume versus object storage, including private-document permissions.
- Shared rate limiting for serverless or multiple instances; the current limiter is per-process memory.
- Database backup scheduling, retention, and recovery objectives.
- Runtime logs/error monitoring and alert destinations.
- SMTP provider, sender verification, final domain, and DNS.

No infrastructure has been provisioned and no live database migration has been applied by this preparation.

Cloudflare Turnstile protects admin/staff login and public appointment/application submissions when both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are configured. Create a Managed widget in Cloudflare and allow `localhost` plus your deployment hostname. Set `TURNSTILE_ALLOWED_HOSTNAMES` to the same comma-separated hostnames (no protocol or path); otherwise the server uses the hostname from `NEXT_PUBLIC_SITE_URL`. Add both keys to Vercel environment variables and redeploy, because the public key is bundled at build time. Never expose the secret. Authenticated CRM record creation does not need another challenge. Missing or invalid verification is rejected when configured; account creation remains admin-only. Test a successful login, a wrong-password retry, a public form submission and a direct login request without a token (must return 403). Removing both keys disables Turnstile; configuring only one key fails environment validation. Run `node --experimental-strip-types scripts/test-turnstile.mjs` for the server validation checks.
