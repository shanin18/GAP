export async function getCms() {
  // Cache hits need neither Payload initialization nor its rich-text/admin modules.
  // getPayload itself shares its initialization promise and handles config HMR.
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@/payload/payload.config"),
  ]);
  return getPayload({ config });
}
