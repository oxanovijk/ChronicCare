export const DEMO_FALLBACK_LABEL = "DEMO_FALLBACK" as const;

type ProviderEnvResult<T> =
  | { configured: true; value: T }
  | { configured: false; invalidKeys: readonly string[] };

export class ProviderConfigurationError extends Error {
  readonly invalidKeys: readonly string[];
  readonly provider: string;

  constructor(provider: string, invalidKeys: readonly string[]) {
    const uniqueKeys = [...new Set(invalidKeys)].sort();

    super(
      `${provider} is unavailable because its server configuration is missing or invalid: ${uniqueKeys.join(", ")}.`,
    );

    this.name = "ProviderConfigurationError";
    this.provider = provider;
    this.invalidKeys = uniqueKeys;
  }
}

export function requireProviderConfig<T>(
  provider: string,
  result: ProviderEnvResult<T>,
) {
  if (!result.configured) {
    throw new ProviderConfigurationError(provider, result.invalidKeys);
  }

  return result.value;
}

export function resolveOcrProviderConfig<T>(
  result: ProviderEnvResult<T>,
  fallbackMode: "disabled" | "synthetic-demo",
) {
  if (result.configured) {
    return { mode: "live" as const, config: result.value };
  }

  if (fallbackMode === "synthetic-demo") {
    return { mode: "demo-fallback" as const, label: DEMO_FALLBACK_LABEL };
  }

  throw new ProviderConfigurationError(
    "Azure AI Document Intelligence",
    result.invalidKeys,
  );
}
