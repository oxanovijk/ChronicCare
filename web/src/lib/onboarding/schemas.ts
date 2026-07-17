import { z } from "zod";

export const ownerOnboardingSchema = z
  .object({
    displayName: z.string().trim().min(2).max(120),
    careCircleName: z.string().trim().min(2).max(120),
  })
  .strict();

export const caregiverRegistrationSchema = ownerOnboardingSchema
  .extend({
    email: z.email().max(254),
    password: z.string().min(8).max(72),
    passwordConfirmation: z.string().min(8).max(72),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "PASSWORD_MISMATCH",
  });

export type OwnerOnboardingInput = z.infer<typeof ownerOnboardingSchema>;

export type OwnerOnboardingDefaults = Partial<OwnerOnboardingInput>;

export function ownerOnboardingDefaultsFromMetadata(
  metadata: unknown,
): OwnerOnboardingDefaults {
  if (typeof metadata !== "object" || metadata === null) return {};
  const values = metadata as Record<string, unknown>;
  const text = z.string().trim().min(2).max(120);
  const displayName = text.safeParse(values["display_name"]);
  const careCircleName = text.safeParse(values["care_circle_name"]);

  return {
    ...(displayName.success ? { displayName: displayName.data } : {}),
    ...(careCircleName.success ? { careCircleName: careCircleName.data } : {}),
  };
}

export function ownerOnboardingInputFromMetadata(metadata: unknown) {
  const result = ownerOnboardingSchema.safeParse(
    ownerOnboardingDefaultsFromMetadata(metadata),
  );
  return result.success ? result.data : null;
}
