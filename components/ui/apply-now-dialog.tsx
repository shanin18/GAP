'use client';

import { type FormEvent, useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './dialog';

const initialForm = { name: '', email: '', phone: '', interestedCountry: '', message: '' };

export function ApplyNowDialog({ triggerClass = '' }: { triggerClass?: string }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (status !== 'idle') setStatus('idle');
    setError('');
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage: window.location.pathname }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit your request.');
      setStatus('success');
      setForm(initialForm);
    } catch (submissionError) {
      setStatus('error');
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to submit your request.');
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild><Button className={triggerClass}>Apply Now</Button></DialogTrigger>
      <DialogContent>
        {status === 'success' ? (
          <div className="grid gap-4 py-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <DialogTitle className="font-display text-4xl tracking-tight">You’re on your way.</DialogTitle>
            <DialogDescription className="text-[var(--muted)]">Thanks for reaching out. Our team will contact you shortly.</DialogDescription>
          </div>
        ) : (
          <>
            <p className="eyebrow">Apply now</p>
            <DialogTitle className="font-display text-4xl tracking-tight">Start your journey.</DialogTitle>
            <DialogDescription className="mt-3 text-[var(--muted)]">Tell us a little about your study-abroad plans.</DialogDescription>
            <form onSubmit={submitLead} className="mt-7 grid gap-4">
              <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} className="field" aria-label="Full name" placeholder="Full name" />
              <input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="field" aria-label="Email address" placeholder="Email address" />
              <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="field" aria-label="Phone number" placeholder="Phone number" />
              <select aria-label="Interested country" required value={form.interestedCountry} onChange={(e) => updateField('interestedCountry', e.target.value)} className="field">
                <option value="" disabled>Interested country</option><option>Australia</option><option>Canada</option><option>New Zealand</option>
              </select>
              <textarea value={form.message} onChange={(e) => updateField('message', e.target.value)} className="field min-h-28" aria-label="Tell us about your goals" placeholder="Tell us about your goals" />
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={status === 'loading'}>{status === 'loading' ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />} {status === 'loading' ? 'Submitting…' : 'Submit interest'}</Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
