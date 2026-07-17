export class EnvironmentConfigurationError extends Error {
  readonly keys: readonly string[];
  readonly scope: string;

  constructor(scope: string, keys: readonly string[]) {
    const uniqueKeys = [...new Set(keys)].sort();

    super(
      `Invalid or missing environment configuration for ${scope}: ${uniqueKeys.join(", ")}.`,
    );

    this.name = "EnvironmentConfigurationError";
    this.scope = scope;
    this.keys = uniqueKeys;
  }
}
