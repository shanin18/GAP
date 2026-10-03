'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi; } }
export const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export function Turnstile({ action, onToken, resetKey = 0 }: { action: string; onToken: (token: string) => void; resetKey?: number }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return;
    setError('');
    callback.current('');
    const api = window.turnstile;
    const id = api.render(container.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      action, theme: 'dark', size: window.matchMedia('(max-width: 400px)').matches ? 'compact' : 'flexible',
      callback: (token: string) => { setError(''); callback.current(token); },
      'expired-callback': () => callback.current(''),
      'error-callback': () => { callback.current(''); setError('Verification unavailable. Please retry.'); },
    });
    return () => { api.remove(id); callback.current(''); };
  }, [ready, action, resetKey]);
  if (!turnstileEnabled) return null;
  return <div className="min-w-0">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setError('Verification could not load. Please reload this page.')} />
    <div ref={container} />
    {!ready && !error && <p role="status" className="text-sm">Loading security verification...</p>}
    {error && <div role="alert" className="text-sm"><p>{error}</p>{ready && <button type="button" onClick={() => { setReady(false); requestAnimationFrame(() => setReady(true)); }} className="underline">Retry verification</button>}</div>}
  </div>;
}
