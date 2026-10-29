import Image, { type ImageProps } from "next/image";
import { isOptimizableImage } from "@/lib/image-hosts.mjs";

const hosts = (process.env.GAP_REMOTE_IMAGE_HOSTS ?? "").split(",").filter(Boolean);

/**
 * next/image for links editors paste into the CMS. Links outside IMAGE_HOSTS (or plain
 * http) would be rejected by the optimizer, so they are shown as-is instead.
 */
export function CmsImage({ src, unoptimized, ...props }: ImageProps) {
  const remote = typeof src === "string" && !isOptimizableImage(src, hosts);
  return <Image src={src} unoptimized={unoptimized || remote} {...props} />;
}
