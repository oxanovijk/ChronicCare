import { z } from "zod";

import {
  type EnvironmentSource,
  normalizeRuntimeEnvironment,
  nonEmpty,
  parseOrThrow,
  webUrl,
} from "./validation";

export const PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function parsePublicEnv(
  source: EnvironmentSource,
  runtime = normalizeRuntimeEnvironment(source.NODE_ENV),
) {
  const schema = z.object({
    NEXT_PUBLIC_APP_URL: webUrl(runtime),
    NEXT_PUBLIC_SUPABASE_URL: webUrl(runtime),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: nonEmpty,
  });

  return parseOrThrow(schema, source, "public browser env");
}
