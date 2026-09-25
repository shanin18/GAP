import { getPayload } from "payload";

// Run explicitly after changing collection fields. Normal page requests do not
// inspect or push the database schema. Production deployments use migrations.
if (process.env.NODE_ENV === "production") {
  throw new Error("cms:sync is development-only. Use cms:migrate for production.");
}
process.env.PAYLOAD_PUSH_SCHEMA = "true";
const { default: config } = await import("../payload/payload.config");
const payload = await getPayload({ config });
await payload.destroy();
console.log("CMS development schema synchronized.");
