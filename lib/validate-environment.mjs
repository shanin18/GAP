/** Validate configuration without logging secret values or connecting to services.
 * @param {Record<string, string | undefined>} values
 * @param {boolean} production
 */
export function validateEnvironment(values, production = values.NODE_ENV === "production") {
  const errors = [];
  const required = (name) => {
    if (!values[name]?.trim()) errors.push(`${name} is required`);
  };
  if (production) {
    for (const name of ["DATABASE_URL", "PAYLOAD_SECRET", "NEXT_PUBLIC_SITE_URL", "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM_ADDRESS", "NOTIFY_EMAIL", "IMAGE_HOSTS"]) required(name);
    if (values.PAYLOAD_SECRET && (values.PAYLOAD_SECRET.length < 32 || /replace-with|development-only/i.test(values.PAYLOAD_SECRET))) {
      errors.push("PAYLOAD_SECRET must be a unique random secret of at least 32 characters");
    }
    if (values.PAYLOAD_PUSH_SCHEMA === "true") errors.push("PAYLOAD_PUSH_SCHEMA must be false in production; use migrations");
  }
  if (values.DATABASE_URL) {
    try {
      const url = new URL(values.DATABASE_URL);
      if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || url.pathname.length < 2) throw new Error();
    } catch { errors.push("DATABASE_URL must be a valid PostgreSQL connection URL"); }
  }
  if (values.NEXT_PUBLIC_SITE_URL) {
    try {
      const url = new URL(values.NEXT_PUBLIC_SITE_URL);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error();
      if (production && (url.protocol !== "https:" || /^(localhost|127\.|\[::1\])/.test(url.hostname))) throw new Error();
    } catch { errors.push("NEXT_PUBLIC_SITE_URL must be a site origin (public HTTPS in production), without a path or query"); }
  }
  if (values.DATABASE_SCHEMA && !/^[a-z_][a-z0-9_]*$/.test(values.DATABASE_SCHEMA)) errors.push("DATABASE_SCHEMA must be a lowercase SQL identifier");
  if (values.SMTP_PORT && (!/^\d+$/.test(values.SMTP_PORT) || Number(values.SMTP_PORT) < 1 || Number(values.SMTP_PORT) > 65535)) errors.push("SMTP_PORT must be between 1 and 65535");
  for (const name of ["EMAIL_FROM_ADDRESS", "NOTIFY_EMAIL"]) {
    if (values[name] && values[name].split(",").some((email) => !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(email.trim()))) errors.push(`${name} must contain valid email addresses`);
  }
  if (values.IMAGE_HOSTS && values.IMAGE_HOSTS.split(",").some((host) => !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i.test(host.trim()))) errors.push("IMAGE_HOSTS must contain explicit hostnames, without URLs or wildcards");
  if (errors.length) throw new Error(`Environment configuration:\n- ${errors.join("\n- ")}`);
}
