import config from '@payload-config';
import { REST_GET, REST_PATCH, REST_DELETE, REST_PUT, REST_OPTIONS } from '@payloadcms/next/routes';

// Explicit public POST routes otherwise shadow Payload's collection endpoints.
// Delegate other methods to Payload so authentication, access and query parsing stay intact.
export function payloadCollectionRoutes(collection: 'leads' | 'applications') {
  const context = { params: Promise.resolve({ slug: [collection] }) };
  return {
    GET: (request: Request) => REST_GET(config)(request, context),
    PATCH: (request: Request) => REST_PATCH(config)(request, context),
    DELETE: (request: Request) => REST_DELETE(config)(request, context),
    PUT: (request: Request) => REST_PUT(config)(request, context),
    OPTIONS: (request: Request) => REST_OPTIONS(config)(request, context),
  };
}
