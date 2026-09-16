# GAP CMS setup

## 1. Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`: Neon/PostgreSQL connection string
- `PAYLOAD_SECRET`: long random secret

### Neon for local QA

1. In the Neon console, select a dedicated test project/branch and open **Connect**.
2. Select the database and role. Disable **Connection pooling** for initial local schema setup.
3. Copy the PostgreSQL connection URL into `DATABASE_URL` in `.env`, preserving its SSL parameters. Do not copy the surrounding `psql` command.
4. Keep the generated local `PAYLOAD_SECRET` and `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

The existing `@payloadcms/db-postgres` adapter connects to Neon using this URL; no replacement adapter is needed. Development schema push can change the selected database, so use the test branch for QA. Production requires reviewed Payload migrations.

Never put actual credentials in `.env.example`. `.env` is ignored by Git.

Reference: https://neon.com/docs/connect/connection-pooling

## 2. Generate types

```bash
npm run generate:types
```

## 3. Start development

```bash
npm run dev
```

Then open:

- `/admin` for the Payload admin area
- `/api` for the Payload REST API

## Notes

The CMS route boundary and query helpers are included in this stage. Before production deployment, verify the installed Payload version's admin/API route exports and complete the first-admin bootstrap against the configured database.
