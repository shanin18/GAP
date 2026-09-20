import { getPayload } from 'payload';
import config from '../payload/payload.config';

const to = process.env.NOTIFY_EMAIL?.split(',')[0]?.trim();
if (!to) {
  console.error('NOTIFY_EMAIL is not set');
  process.exit(1);
}

const payload = await getPayload({ config });
try {
  await payload.sendEmail({ to, subject: 'GAP test email', text: 'If you can read this, email sending works.' });
  console.log(`Done. Check the inbox of ${to}, and the spam folder.`);
} catch (error) {
  console.error('Sending failed:', error);
  process.exitCode = 1;
} finally {
  await payload.destroy();
}
