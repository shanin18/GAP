'use client';

import { useEffect, useRef, useState } from 'react';
import { useConfig } from '@payloadcms/ui';
import { Turnstile, turnstileEnabled } from '../ui/turnstile';

export function LoginVerification() {
  const { config } = useConfig();
  const token = useRef('');
  const [reset, setReset] = useState(0);
  useEffect(() => {
    if (!turnstileEnabled) return;
    const original = window.fetch;
    const loginPath = `${config.routes.api}/users/login`;
    let mounted = true;
    const bridge: typeof fetch = async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input), window.location.origin);
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
      if (url.origin !== window.location.origin || url.pathname !== loginPath || method !== 'POST') return original.call(window, input, init);
      if (!token.current) return new Response(JSON.stringify({ errors: [{ message: 'Please complete the security verification before logging in.' }] }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
      headers.set('x-turnstile-token', token.current);
      token.current = '';
      try { return await original.call(window, input, { ...init, headers }); }
      finally { if (mounted) setReset(value => value + 1); }
    };
    window.fetch = bridge;
    return () => { mounted = false; if (window.fetch === bridge) window.fetch = original; };
  }, [config.routes.api]);
  return turnstileEnabled ? <div style={{ margin: '1rem 0' }}><Turnstile action="login" onToken={value => { token.current = value; }} resetKey={reset} /></div> : null;
}
