import { z } from "zod";

import { EnvironmentConfigurationError } from "./errors";

export type EnvironmentSource = Record<string, string | undefined>;
export type RuntimeEnvironment = "development" | "test" | "production";

export const nonEmpty = z.string().trim().min(1);

export function webUrl(runtime: RuntimeEnvironment) {
  return z.url().refine((value) => {
    if (!URL.canParse(value)) {
      return false;
    }

    const protocol = new URL(value).protocol;

    return (
      protocol === "https:" ||
      (runtime !== "production" && protocol === "http:")
    );
  }, "Must use HTTPS outside local development");
}

function invalidKeys(error: z.ZodError) {
  return error.issues.map((issue) => String(issue.path[0] ?? "unknown"));
}

export function parseOrThrow<T>(
  schema: z.ZodType<T>,
  source: EnvironmentSource,
  scope: string,
): T {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new EnvironmentConfigurationError(scope, invalidKeys(result.error));
  }

  return result.data;
}

export function inspect<T>(
  schema: z.ZodType<T>,
  source: EnvironmentSource,
) {
  const result = schema.safeParse(source);

  if (result.success) {
    return { configured: true as const, value: result.data };
  }

  return {
    configured: false as const,
    invalidKeys: [...new Set(invalidKeys(result.error))].sort(),
  };
}

export function normalizeRuntimeEnvironment(
  value: string | undefined,
): RuntimeEnvironment {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}
