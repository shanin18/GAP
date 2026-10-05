// Server entry points only: never import this module from a client component.
function rejected(reason: string, details: Record<string, unknown> = {}): false {
  // Never log tokens, credentials, or submitted form/account data.
  console.warn('[Turnstile] Verification rejected', { reason, ...details });
  return false;
}

export async function verifyTurnstile(token: unknown, action: string): Promise<boolean> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!siteKey && !secret) return true;
  if (!siteKey || !secret) return rejected('incomplete-configuration');
  if (typeof token !== 'string' || !token || token.length > 2048) return rejected('missing-or-invalid-token');
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!response.ok) return rejected('siteverify-http-error', { status: response.status });
    const result = await response.json() as { success?: boolean; action?: string; hostname?: string; 'error-codes'?: string[] };
    const allowed = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname)
      .split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
    if (result.success !== true) return rejected('siteverify-rejected', { codes: result['error-codes'] });
    if (result.action !== action) return rejected('action-mismatch', { expected: action, received: result.action });
    if (typeof result.hostname !== 'string' || !allowed.includes(result.hostname.toLowerCase())) {
      return rejected('hostname-mismatch', { received: result.hostname, allowed });
    }
    return true;
  } catch { return rejected('siteverify-network-or-response-error'); }
}
