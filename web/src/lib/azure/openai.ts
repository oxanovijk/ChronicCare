import "server-only";

import { AzureOpenAI } from "openai";

import { requireProviderConfig } from "@/lib/config/provider-policy";
import { getAzureOpenAIEnv } from "@/lib/env/server";

export function createAzureOpenAIClient() {
  const env = requireProviderConfig("Azure OpenAI", getAzureOpenAIEnv());

  return new AzureOpenAI({
    apiKey: env.AZURE_OPENAI_API_KEY,
    apiVersion: env.AZURE_OPENAI_API_VERSION,
    deployment: env.AZURE_OPENAI_DEPLOYMENT,
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    logLevel: "error",
  });
}
