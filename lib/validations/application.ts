import { z } from 'zod';
const relationshipId = z.union([z.number(), z.string().trim().regex(/^[1-9]\d*$/)])
  .transform(Number).pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER));
export const applicationSchema = z.object({
  studentName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  countryId: relationshipId,
  universityId: relationshipId.optional().nullable(),
  studyLevel: z.enum(['Foundation','Undergraduate','Postgraduate','PhD','Other']),
  intake: z.string().trim().max(100).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  sourcePage: z.string().trim().max(200).optional().or(z.literal('')),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;
