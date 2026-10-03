// Server entry points only: never import this module from a client component.
export async function verifyTurnstile(token: unknown, action: string): Promise<boolean> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!siteKey && !secret) return true;
  if (!siteKey || !secret || typeof token !== 'string' || !token || token.length > 2048) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (!response.ok) return false;
    const result = await response.json() as { success?: boolean; action?: string; hostname?: string };
    const allowed = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname)
      .split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
    return result.success === true && result.action === action && typeof result.hostname === 'string' && allowed.includes(result.hostname.toLowerCase());
  } catch { return false; }
}
