import { NextResponse } from 'next/server';
import { rateLimit } from './rate-limit';

const MAX_BODY_BYTES = 20_000;

export function clientIp(request: Request) {
  // Only trustworthy behind a proxy or host that sets this header (Vercel, nginx, Cloudflare...)
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

/** Browsers always send Origin on cross-site POSTs, so a mismatch means a cross-site request. */
function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type GuardResult = { body: unknown } | { response: NextResponse };

/**
 * Shared checks for public forms: same-origin, size limit, rate limit, JSON parsing.
 * Returns either the parsed body or a ready-made error response.
 */
export async function guardPublicPost(
  request: Request,
  opts: { key: string; limit: number; windowMs: number },
): Promise<GuardResult> {
  if (!isSameOrigin(request)) {
    return { response: NextResponse.json({ error: 'Request not allowed.' }, { status: 403 }) };
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return { response: NextResponse.json({ error: 'Request is too large.' }, { status: 413 }) };
  }

  const limited = rateLimit(`${opts.key}:${clientIp(request)}`, opts.limit, opts.windowMs);
  if (!limited.ok) {
    return {
      response: NextResponse.json(
        { error: 'Too many requests. Please try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } },
      ),
    };
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return { response: NextResponse.json({ error: 'Request is too large.' }, { status: 413 }) };
  }

  let body: unknown = null;
  try {
    body = JSON.parse(text);
  } catch {
    /* leave null: the schema check returns a friendly error */
  }
  return { body };
}

/** Hidden "website" input that real users never fill in; bots usually do. */
export function isHoneypotFilled(body: unknown) {
  return Boolean(body && typeof body === 'object' && (body as Record<string, unknown>).website);
}