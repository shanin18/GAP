// Shared by next.config.mjs and the browser, so both agree on which remote images
// the Next.js optimizer accepts.

// An existing Australia CMS image uses this Google thumbnail host.
// Keep the permission scoped to its image endpoint, rather than all Google hosts.
const legacyCountryImage = { hostname: 'encrypted-tbn0.gstatic.com', pathname: '/images' };

/** Explicit HTTPS hosts from IMAGE_HOSTS, plus Cloudinary when it stores uploads. */
export function remoteImageHosts(env) {
  const hosts = (env.IMAGE_HOSTS ?? '').split(',').map((h) => h.trim()).filter(Boolean);
  if (env.UPLOAD_STORAGE === 'cloudinary') hosts.push('res.cloudinary.com');
  return hosts;
}

export function remoteImagePatterns(hosts) {
  return [
    ...hosts.map((hostname) => ({ protocol: 'https', hostname })),
    { protocol: 'https', ...legacyCountryImage },
  ];
}

/** True for site paths and remote URLs the optimizer is configured to fetch. */
export function isOptimizableImage(src, hosts) {
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return hosts.some((h) => h.toLowerCase() === host)
      || (host === legacyCountryImage.hostname && url.pathname === legacyCountryImage.pathname);
  } catch {
    return false;
  }
}
