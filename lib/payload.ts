import { getPayload } from 'payload';
import config from '@/payload/payload.config';

let payloadPromise: ReturnType<typeof getPayload> | undefined;

export function getCms() {
  payloadPromise ??= getPayload({ config }).catch((error) => {
    payloadPromise = undefined;
    throw error;
  });
  return payloadPromise;
}
