'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@payloadcms/ui';
import { ADMIN_MARKER_COOKIE, ADMIN_TAB_NAME } from '../edit-this-page';

/**
 * Lets the public website show "Edit this page" to admins without checking the login on every visit.
 * Only a marker: it grants nothing, and is cleared on logout. Lasts as long as an admin session (8 hours).
 */
export function AdminMarker({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  useEffect(() => {
    // Lets the website's "Edit this page" links reuse this tab instead of opening another one
    window.name = ADMIN_TAB_NAME;
  }, []);
  useEffect(() => {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = user?.role === 'admin'
      ? `${ADMIN_MARKER_COOKIE}=1; Path=/; Max-Age=${8 * 60 * 60}; SameSite=Lax${secure}`
      : `${ADMIN_MARKER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  }, [user?.role]);
  return children;
}
