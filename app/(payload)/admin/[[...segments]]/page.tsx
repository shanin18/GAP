import config from "@/payload/payload.config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap";

type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export function generateMetadata({ params, searchParams }: Props) {
  return generatePageMetadata({ config, params, searchParams });
}

export default function AdminPage({ params, searchParams }: Props) {
  return RootPage({ config, importMap, params, searchParams });
}
