/**
 * Disposable credential check for the two Azure providers.
 *
 * Run:  npx tsx scripts/verify-azure.ts        (from /web)
 *
 * Reuses the project's real env schemas, so a pass here means the app's own
 * validation accepts the values — not just that they are non-empty.
 *
 * Cost: Document Intelligence uses a free management call. Azure OpenAI uses
 * models.list() (free) plus one 1-token completion, the only way to prove the
 * deployment name resolves.
 *
 * Secrets are scrubbed from all output. Not part of any packet; delete freely.
 */
import { config } from "dotenv";

config({ path: ".env" });

import {
  AzureKeyCredential,
  DocumentModelAdministrationClient,
} from "@azure/ai-form-recognizer";
import { AzureOpenAI } from "openai";

import { requireProviderConfig } from "../src/lib/config/provider-policy";
import {
  inspectAzureDocumentIntelligenceEnv,
  inspectAzureOpenAIEnv,
} from "../src/lib/env/server-schema";

const secrets: string[] = [];

/** Keep endpoints and keys out of stdout even when an SDK embeds them in errors. */
function scrub(text: string) {
  return secrets.reduce(
    (acc, secret) => (secret ? acc.replaceAll(secret, "[redacted]") : acc),
    text,
  );
}

function describe(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  return scrub(raw).split("\n")[0]?.slice(0, 300) ?? "unknown error";
}

async function checkDocumentIntelligence() {
  const env = requireProviderConfig(
    "Azure AI Document Intelligence",
    inspectAzureDocumentIntelligenceEnv(process.env),
  );
  secrets.push(
    env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
    env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
  );

  const client = new DocumentModelAdministrationClient(
    env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    new AzureKeyCredential(env.AZURE_DOCUMENT_INTELLIGENCE_KEY),
  );

  const model = await client.getDocumentModel(
    env.AZURE_DOCUMENT_INTELLIGENCE_MODEL,
  );

  return `model "${model.modelId}" is reachable`;
}

async function checkAzureOpenAI() {
  const env = requireProviderConfig(
    "Azure OpenAI",
    inspectAzureOpenAIEnv(process.env),
  );
  secrets.push(env.AZURE_OPENAI_API_KEY, env.AZURE_OPENAI_ENDPOINT);

  const client = new AzureOpenAI({
    apiKey: env.AZURE_OPENAI_API_KEY,
    apiVersion: env.AZURE_OPENAI_API_VERSION,
    deployment: env.AZURE_OPENAI_DEPLOYMENT,
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    logLevel: "error",
  });

  // Not secret, and the two values that most often explain a 404.
  const host = new URL(env.AZURE_OPENAI_ENDPOINT).hostname;
  console.log(`   endpoint kind: *.${host.split(".").slice(1).join(".")}`);
  console.log(`   api-version:   ${env.AZURE_OPENAI_API_VERSION}`);

  // Advisory only: some resource kinds do not serve /models even though
  // chat completions work. A failure here is not proof of bad credentials.
  try {
    await client.models.list();
    console.log("   models.list  ok");
  } catch (error) {
    console.log(`   models.list  unavailable (${describe(error)})`);
  }

  const ask = (tokenLimit: Record<string, number>) =>
    client.chat.completions.create({
      messages: [{ role: "user", content: "ping" }],
      model: env.AZURE_OPENAI_DEPLOYMENT,
      ...tokenLimit,
    });

  // Newer deployments reject max_tokens and require max_completion_tokens.
  // Those are reasoning-capable: they spend budget on reasoning before any
  // visible output, so the retry needs headroom rather than a single token.
  try {
    await ask({ max_tokens: 1 });
  } catch (error) {
    if (!describe(error).includes("max_completion_tokens")) throw error;
    console.log("   deployment wants max_completion_tokens, retrying");
    await ask({ max_completion_tokens: 256 });
  }

  return `deployment "${env.AZURE_OPENAI_DEPLOYMENT}" answered`;
}

async function run(label: string, check: () => Promise<string>) {
  console.log(`\n${label}`);
  try {
    console.log(`   PASS - ${await check()}`);
    return true;
  } catch (error) {
    console.log(`   FAIL - ${describe(error)}`);
    return false;
  }
}

// Wrapped rather than top-level await: tsx transforms .ts as CJS here because
// package.json declares no "type": "module".
async function main() {
  const results = [
    await run("Azure AI Document Intelligence", checkDocumentIntelligence),
    await run("Azure OpenAI", checkAzureOpenAI),
  ];

  const passed = results.every(Boolean);
  console.log(passed ? "\nBoth providers OK.\n" : "\nAt least one failed.\n");
  // exitCode, not exit(): exit() while sockets are open crashes libuv on Windows.
  process.exitCode = passed ? 0 : 1;
}

void main();
