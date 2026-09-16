import { headers } from 'next/headers';
import { getCms } from '@/lib/payload';

export async function getAuthenticatedStaff() {
  const payload = await getCms();
  const requestHeaders = await headers();
  try {
    const result = await payload.auth({ headers: requestHeaders });
    return result.user ?? null;
  } catch {
    return null;
  }
}
