# Global Admission Platform

Next.js website, Payload CMS, and staff CRM backed by PostgreSQL.

## Local setup

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and supply your development database URL and a random Payload secret. Use `DATABASE_SCHEMA=gap` and `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
3. For an empty database, run `npm run cms:migrate`. For an existing database, read [the migration guidance](DEPLOYMENT.md#database-migrations) first; do not apply the initial migration over existing tables.
4. Run `npm run dev`, open `/admin`, and create the first administrator.
5. Run `npm run cms:initialize` if you need the default website content. It preserves existing edits; in development it also synchronizes the schema, so use a dedicated development database.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | TypeScript check |
| `npm run generate:types` | Regenerate Payload types |
| `npm run env:check` | Validate production configuration without service connections |
| `npm run cms:migrate:create -- change_name` | Generate a schema migration |
| `npm run cms:migrate:status` / `npm run cms:migrate` | Inspect / apply migrations |
| `npm run cms:sync` | Development-only schema synchronization |
| `npm run cms:verify` | CMS verification in a disposable database schema |

## Guides

Admin dashboard summaries and navigation badges use a bounded, per-user, 30-second server-memory cache. Collection saves/deletes clear it on the current process; other instances expire within 30 seconds. Authentication and editable records remain live. Sidebar routes prefetch on hover/focus. Development compilation and cold database connections are not representative of warm production navigation.

- [Editing content and managing student records](CMS-EDITING.md)
- [Admin/staff roles, daily workflows and every sidebar item](WORKSPACE-GUIDE.md)
- [Production deployment, configuration, and recovery](DEPLOYMENT.md)
- [Image sources and replacement notes](documentation/visual-assets.md)
- [Globe destinations and coordinate attribution](documentation/globe-destinations.md)

Keep `.env`, private documents, and database backups out of Git. Uploaded files require durable storage in production.
