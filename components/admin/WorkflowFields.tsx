'use client';

import { RelationshipField, useAuth, useField } from '@payloadcms/ui';
import type { ComponentProps } from 'react';

export function AssignmentField(props: ComponentProps<typeof RelationshipField>) {
  const { user } = useAuth();
  const { value } = useField<number | string | { id: number | string }>({ path: props.path });
  const id = value && typeof value === 'object' ? value.id : value;
  if (user?.role === 'admin') return <RelationshipField {...props} />;
  return <div className="field-type"><label className="field-label">Assigned to</label>
    <p>{!id ? 'Not assigned yet' : String(id) === String(user?.id) ? user?.email : 'Another staff member'}</p>
    <p className="field-description">Read-only: admins manage assignments. New records you create are assigned to your account when saved.</p>
  </div>;
}

export function VerificationStatus({ path }: { path: string }) {
  const { value } = useField<boolean>({ path });
  return <div className="field-type"><label className="field-label">Email verification status</label>
    <p>{value ? 'Verified' : 'Not verified'}</p>
    <p className="field-description">System-managed, read-only status. Automatic email verification is not enabled. Neither staff nor admins need to fill this in.</p>
  </div>;
}
