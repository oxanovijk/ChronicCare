import { z } from "zod";

export const invitationTokenSchema = z
  .string()
  .length(43)
  .regex(/^[A-Za-z0-9_-]+$/);

export const createInvitationSchema = z
  .object({
    expiresInHours: z.number().int().min(1).max(168).default(24),
  })
  .strict();

export const acceptInvitationSchema = z
  .object({ displayName: z.string().trim().min(2).max(120) })
  .strict();

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
