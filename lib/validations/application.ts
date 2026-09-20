import { z } from 'zod';

// Empty strings become undefined, so the database never stores "" for optional fields
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => v || undefined);

// Payload's Postgres ids are 32-bit integers, so anything larger would fail in the database
const relationshipId = z
  .union([z.number(), z.string().trim().regex(/^[1-9]\d*$/)])
  .transform(Number)
  .pipe(z.number().int().positive().max(2_147_483_647));

export const applicationSchema = z.object({
  studentName: z.string().trim().min(2, 'Please enter your full name.').max(100, 'That name is too long.'),
  email: z.string().trim().toLowerCase().max(254, 'That email address is too long.').email('Please enter a valid email address.'),
  phone: optionalText(40).refine((v) => !v || /^[+()\-.\s\d]{5,40}$/.test(v), 'Please enter a valid phone number.'),
  countryId: relationshipId,
  universityId: relationshipId.optional().nullable(),
  studyLevel: z.enum(['Foundation', 'Undergraduate', 'Postgraduate', 'PhD', 'Other']),
  intake: optionalText(100),
  message: optionalText(2000),
  sourcePage: optionalText(200),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
