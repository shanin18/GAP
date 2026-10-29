'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useConfig, useSelection } from '@payloadcms/ui';

/**
 * List views: with exactly one row selected, "Edit" opens that record's full form (every field with its
 * current value) instead of Payload's bulk-edit panel. With several rows selected, bulk edit is unchanged.
 */
export function SingleRecordEdit() {
  const { count, selectAll, selectedIDs } = useSelection();
  const { config } = useConfig();
  const router = useRouter();
  const pathname = usePathname();
  const listPath = pathname.replace(/\/$/, '');
  // "Select all across pages" may not list IDs, so only act on a single explicitly ticked row
  const id = count === 1 && selectAll !== 'allAvailable' && selectedIDs.length === 1 ? selectedIDs[0] : null;

  useEffect(() => {
    if (id == null || !listPath.startsWith(`${config.routes.admin}/collections/`)) return;
    const openRecord = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest('.edit-many > .list-selection__button')) return;
      // Capture phase on document runs before React's handler, so the bulk-edit drawer never opens
      event.preventDefault();
      event.stopPropagation();
      router.push(`${listPath}/${id}`);
    };
    document.addEventListener('click', openRecord, true);
    return () => document.removeEventListener('click', openRecord, true);
  }, [id, listPath, config.routes.admin, router]);

  return null;
}
