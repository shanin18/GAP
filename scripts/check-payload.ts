import { getPayload } from 'payload';
import config from '../payload/payload.config';

console.log('Initializing Payload with configured PostgreSQL database...');
const payload = await getPayload({ config });
console.log('Payload initialized.');
console.log(JSON.stringify({ countries: (await payload.count({ collection: 'countries' })).totalDocs }));
await payload.destroy();
