import { z } from "zod";

export const chatRequestSchema = z
  .object({
    sessionId: z.uuid().nullable().optional().default(null),
    message: z.string().trim().min(1).max(4000),
  })
  .strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatPersona = "PATIENT" | "CAREGIVER";

export type ChatResponse = {
  sessionId: string;
  message: {
    role: "ASSISTANT";
    content: string;
    isFallback: boolean;
  };
};
