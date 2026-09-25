# GAP security and deployment checklist

See [DEPLOYMENT.md](DEPLOYMENT.md) for environment validation, migration commands, release ordering, storage, and rollback procedures.

## Authentication and authorization
- Payload `users` remains the staff auth collection.
- `/staff` now requires a valid Payload-authenticated staff session and otherwise redirects to Payload login.
- Leads and applications remain readable/updatable only by authenticated staff; destructive actions are admin-only.
- Private documents are an upload-enabled `documents` collection. Read/create/update require staff authentication; delete is admin-only.
- Payload Local API bypasses access control by default. Any future user-context Local API operation must pass the authenticated user and `overrideAccess: false` when access rules must be enforced.

## Documents
- Accepted types: PDF, JPEG, PNG and WebP.
- Document responses receive `private, no-store`, `nosniff`, and sandbox CSP headers.
- For production, use private object storage rather than relying on an ephemeral deployment filesystem. Configure a Payload storage adapter and retain collection access control.
- Add malware scanning before allowing untrusted public/student uploads.

## Production environment
Required: `DATABASE_URL`, strong `PAYLOAD_SECRET`, and canonical `NEXT_PUBLIC_SITE_URL`.
Never commit production secrets. Rotate secrets if exposed.

## Pre-release
Run `npm install`, `npm run generate:types`, `npm run typecheck`, and `npm run build` using the deployment Node version. Test admin login, staff redirect, lead/application submission, CMS publishing, 404/error states, sitemap and robots.
