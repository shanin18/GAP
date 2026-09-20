import config from '@payload-config';
import {
  REST_GET,
  REST_PATCH,
  REST_DELETE,
  REST_PUT,
  REST_OPTIONS,
  REST_POST,
} from '@payloadcms/next/routes';
import { getCms } from './payload';

// Built once, not on every request
const handlers = {
  get: REST_GET(config),
  patch: REST_PATCH(config),
  delete: REST_DELETE(config),
  put: REST_PUT(config),
  options: REST_OPTIONS(config),
  post: REST_POST(config),
};

/** True when the request comes from the Payload admin panel (not from a public website form). */
function isAdminPanelRequest(request: Request) {
  // The admin panel sends multipart form data...
  if ((request.headers.get('content-type') ?? '').includes('multipart/form-data')) return true;
  // ...from a page under /admin
  const referer = request.headers.get('referer');
  if (!referer) return false;
  try {
    return new URL(referer).pathname.startsWith('/admin');
  } catch {
    return false;
  }
}

// Explicit public POST routes otherwise shadow Payload's collection endpoints.
// Delegate other methods to Payload so authentication, access and query parsing stay intact.
export function payloadCollectionRoutes(collection: 'leads' | 'applications') {
  const context = { params: Promise.resolve({ slug: [collection] }) };
  return {
    GET: (request: Request) => handlers.get(request, context),
    PATCH: (request: Request) => handlers.patch(request, context),
    DELETE: (request: Request) => handlers.delete(request, context),
    PUT: (request: Request) => handlers.put(request, context),
    OPTIONS: (request: Request) => handlers.options(request, context),

    /**
     * Staff creating a record from the admin panel: hand the request to Payload untouched.
     * Returns null for everything else, including a logged-in staff member who is testing the
     * public form in the same browser, so the public form logic (and its emails) still runs.
     */
    staffPost: async (request: Request) => {
      if (!isAdminPanelRequest(request)) return null;
      const payload = await getCms();
      const { user } = await payload.auth({ headers: request.headers });
      return user ? handlers.post(request, context) : null;
    },
  };
}