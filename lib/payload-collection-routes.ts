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
     * The admin panel creates records with POST /api/<collection>, which the public form
     * route shadows. When a logged-in staff member is posting, hand the request to Payload
     * untouched. Returns null for visitors, so the caller runs the public form logic.
     */
    staffPost: async (request: Request) => {
      const payload = await getCms();
      const { user } = await payload.auth({ headers: request.headers });
      return user ? handlers.post(request, context) : null;
    },
  };
}