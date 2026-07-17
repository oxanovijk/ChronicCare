import { z } from "zod";

export const createSosSchema = z
  .object({
    message: z.string().trim().min(1).max(500).nullable().optional().default(null),
  })
  .strict();

export const idempotencyKeySchema = z.uuid();
export const sosEventIdSchema = z.uuid();
export const sosStatusQuerySchema = z.literal("NEW").default("NEW");

export type CreateSosInput = z.infer<typeof createSosSchema>;
