'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useConfig } from '@payloadcms/ui';
import { isTrackedUpload, uploadWithProgress, type UploadProgress as Progress } from '@/lib/upload-progress';

export function UploadProgress({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const [uploads, setUploads] = useState<Progress[]>([]);
  useEffect(() => {
    const original = window.fetch;
    let active = true;
    let sequence = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const update = (item: Progress) => {
      if (!active) return;
      setUploads(current => {
        const old = current.find(value => value.id === item.id);
        if (old?.percent === item.percent && old?.phase === item.phase) return current;
        return old ? current.map(value => value.id === item.id ? item : value) : [...current, item];
      });
    };
    const bridge: typeof fetch = async (input, init) => {
      if (!isTrackedUpload(input, init, window.location.origin, config.routes.api)) return original.call(window, input, init);
      const body = init!.body as FormData;
      const file = Array.from(body.values()).find(value => value instanceof File) as File | undefined;
      const item: Progress = { id: ++sequence, name: file?.name ?? 'File', percent: 0, phase: 'uploading' };
      update(item);
      try {
        const response = await uploadWithProgress(String(input), init!, (percent, saving) => update({ ...item, percent, phase: saving ? 'saving' : 'uploading' }));
        update({ ...item, percent: response.ok ? 100 : null, phase: response.ok ? 'done' : 'error' });
        return response;
      } catch (error) {
        update({ ...item, percent: null, phase: 'error' });
        throw error;
      } finally {
        if (active) {
          const timer = setTimeout(() => { timers.delete(timer); setUploads(current => current.filter(value => value.id !== item.id)); }, 6000);
          timers.add(timer);
        }
      }
    };
    window.fetch = bridge;
    return () => {
      active = false;
      if (window.fetch === bridge) window.fetch = original;
      timers.forEach(clearTimeout);
    };
  }, [config.routes.api]);
  return <>{children}{uploads.length > 0 && <aside className="gap-upload-progress" aria-label="File upload progress">
    {uploads.slice(-3).map(item => <div key={item.id} className="gap-upload-progress__item">
      <strong title={item.name}>{item.name}</strong>
      <span role="status">{item.phase === 'uploading' ? `Uploading${item.percent === null ? '…' : ` · ${item.percent}%`}` : item.phase === 'saving' ? 'Transfer complete · Processing and saving…' : item.phase === 'done' ? 'Saved successfully · 100%' : 'Upload failed · Check the form and retry'}</span>
      <progress aria-label={`Upload ${item.name}`} max={100} value={item.phase === 'saving' || item.percent === null ? undefined : item.percent} />
    </div>)}
    {uploads.length > 3 && <small>{uploads.length - 3} more uploads</small>}
  </aside>}</>;
}
