# Deployment and handover

The hosting provider and domain are still undecided. This guide prepares the release without choosing infrastructure or changing the current database.

## Configuration

Copy `.env.example` into your local environment or the hosting provider's secret manager. Never commit real credentials. Set `NODE_ENV=production` for deployment commands.

- `DATABASE_URL`: PostgreSQL connection string. Use the provider's certificate-verified TLS connection. Use a direct connection for migrations where the provider requires it.
- `DATABASE_SCHEMA`: must match the schema in the committed migration files. Do not change it independently after generating migrations.
- `PAYLOAD_SECRET`: unique random secret, at least 32 characters. Generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`. Keep it stable across instances and deployments.
- `NEXT_PUBLIC_SITE_URL`: the final HTTPS origin, without a path. Set it before building; rebuild when changing the domain.
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT`: email transport. Port 465 uses implicit TLS; other ports use Nodemailer's SMTP negotiation.
- `EMAIL_FROM_ADDRESS`: a sender address authorized by the email provider.
- `NOTIFY_EMAIL`: comma-separated staff inboxes for enquiries and applications.
- `IMAGE_HOSTS`: comma-separated explicit external image hostnames used by published content. Local uploaded images do not need an entry. Wildcards and full URLs are rejected.
- `EMAIL_LOGO_URL`: optional publicly accessible logo; preferably PNG.
- `PAYLOAD_PUSH_SCHEMA=false`: always in production.

Run `npm run env:check` to validate production settings without connecting to services. It prints setting names, not credentials. A local localhost URL or placeholder configuration is expected to fail this production check. Successful validation does not prove database or SMTP connectivity.

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

- Persistent volume versus object storage, including private-document permissions.
- Shared rate limiting for serverless or multiple instances; the current limiter is per-process memory.
- Database backup scheduling, retention, and recovery objectives.
- Runtime logs/error monitoring and alert destinations.
- SMTP provider, sender verification, final domain, and DNS.

No infrastructure has been provisioned and no live database migration has been applied by this preparation.
