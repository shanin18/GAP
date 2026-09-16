import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  interestedCountry: z.string().trim().max(80).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  sourcePage: z.string().trim().max(200).optional().or(z.literal('')),
});

export type LeadInput = z.infer<typeof leadSchema>;
