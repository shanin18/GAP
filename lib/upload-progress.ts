export type UploadProgress = { id: number; name: string; percent: number | null; phase: 'uploading' | 'saving' | 'done' | 'error' };

/** Only intercept Payload's same-origin multipart file writes. Everything else uses fetch. */
export function isTrackedUpload(input: RequestInfo | URL, init: RequestInit | undefined, origin: string, api: string) {
  if (input instanceof Request) return false;
  if (!(init?.body instanceof FormData) || !['POST', 'PATCH', 'PUT'].includes((init.method ?? 'GET').toUpperCase())) return false;
  const url = new URL(input instanceof Request ? input.url : String(input), origin);
  if (url.origin !== origin) return false;
  const base = api.replace(/\/$/, '');
  if (![`${base}/media`, `${base}/documents`].some(path => url.pathname === path || (url.pathname.startsWith(`${path}/`) && /^\d+$/.test(url.pathname.slice(path.length + 1))))) return false;
  return Array.from(init.body.values()).some(value => value instanceof Blob && value.size > 0);
}

export function uploadWithProgress(url: string, init: RequestInit, report: (percent: number | null, saving: boolean) => void): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    const cleanup = () => init.signal?.removeEventListener('abort', abort);
    xhr.open(init.method ?? 'POST', url);
    xhr.withCredentials = init.credentials !== 'omit';
    xhr.responseType = 'arraybuffer';
    new Headers(init.headers).forEach((value, name) => {
      if (name.toLowerCase() !== 'content-type') xhr.setRequestHeader(name, value);
    });
    xhr.upload.onprogress = event => report(event.lengthComputable ? Math.min(100, Math.round(event.loaded / event.total * 100)) : null, false);
    xhr.upload.onload = () => report(100, true);
    xhr.onload = () => {
      cleanup();
      const headers = new Headers();
      xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(line => {
        const colon = line.indexOf(':');
        if (colon > 0) headers.append(line.slice(0, colon), line.slice(colon + 1).trim());
      });
      resolve(new Response([204, 205, 304].includes(xhr.status) ? null : xhr.response, { status: xhr.status, statusText: xhr.statusText, headers }));
    };
    xhr.onerror = () => { cleanup(); reject(new TypeError('Upload connection failed.')); };
    xhr.onabort = () => { cleanup(); reject(new DOMException('Upload aborted', 'AbortError')); };
    if (init.signal?.aborted) { reject(new DOMException('Upload aborted', 'AbortError')); return; }
    init.signal?.addEventListener('abort', abort, { once: true });
    xhr.send(init.body as FormData);
  });
}
