import config from "@/payload/payload.config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap";
import { getAuthenticatedStaff } from '@/lib/security';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export function generateMetadata({ params, searchParams }: Props) {
  return generatePageMetadata({ config, params, searchParams });
}

export default async function AdminPage({ params, searchParams }: Props) {
  const { segments = [] } = await params;
  if (segments[0] === 'collections' && segments[1] === 'users') {
    const user = await getAuthenticatedStaff();
    if (user && user.role !== 'admin') redirect('/admin/account');
  }
  return RootPage({ config, importMap, params, searchParams });
}
