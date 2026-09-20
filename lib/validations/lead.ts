import { z } from 'zod';

// Empty strings become undefined, so the database never stores "" for optional fields
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => v || undefined);

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(100, 'That name is too long.'),
  email: z.string().trim().toLowerCase().max(254, 'That email address is too long.').email('Please enter a valid email address.'),
  phone: optionalText(40).refine((v) => !v || /^[+()\-.\s\d]{5,40}$/.test(v), 'Please enter a valid phone number.'),
  interestedCountry: optionalText(80),
  message: optionalText(2000),
  sourcePage: optionalText(200),
});

export type LeadInput = z.infer<typeof leadSchema>;
