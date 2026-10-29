'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, toast, useConfig, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui';

/** Lead sidebar: one click creates the student's application and links it. */
export function ConvertLead() {
  const { id } = useDocumentInfo();
  const { config } = useConfig();
  const router = useRouter();
  const modified = useFormModified();
  const application = useFormFields(([fields]) => fields.application?.value) as number | string | { id: number | string } | null | undefined;
  const [busy, setBusy] = useState(false);
  if (!id) return null; // a lead must exist before it can be converted

  const applicationId = application && typeof application === 'object' ? application.id : application;
  const applicationHref = (target: number | string) => `${config.routes.admin}/collections/applications/${target}`;

  if (applicationId) {
    return <div className="field-type">
      <label className="field-label">Application</label>
      <p><Link prefetch={false} href={applicationHref(applicationId)}>Open the student’s application →</Link></p>
    </div>;
  }

  async function convert() {
    setBusy(true);
    try {
      const response = await fetch(`${config.serverURL ?? ''}${config.routes.api}/leads/${id}/convert`, { method: 'POST', credentials: 'include' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not convert this lead.');
      toast.success(result.existing ? 'This lead already has an application.' : 'Application created and linked.');
      router.push(applicationHref(result.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not convert this lead.');
      setBusy(false);
    }
  }

  return <div className="field-type">
    <Button buttonStyle="secondary" size="medium" disabled={busy || modified} onClick={convert}>
      {busy ? 'Creating application…' : 'Convert to application'}
    </Button>
    <p className="field-description">
      {modified
        ? 'Save your changes first. The application is created from the saved lead.'
        : 'Creates the student’s application from this lead, links it and marks the lead Converted.'}
    </p>
  </div>;
}
