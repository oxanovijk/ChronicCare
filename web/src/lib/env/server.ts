import "server-only";

import {
  inspectAzureDocumentIntelligenceEnv,
  inspectAzureOpenAIEnv,
  inspectSupabaseAdminEnv,
  parseCoreServerEnv,
  parseProviderFlags,
} from "./server-schema";

export function getCoreServerEnv() {
  return parseCoreServerEnv(process.env);
}

export function getSupabaseAdminEnv() {
  return inspectSupabaseAdminEnv(process.env);
}

export function getAzureOpenAIEnv() {
  return inspectAzureOpenAIEnv(process.env);
}

export function getAzureDocumentIntelligenceEnv() {
  return inspectAzureDocumentIntelligenceEnv(process.env);
}

export function getProviderFlags() {
  return parseProviderFlags(process.env);
}
