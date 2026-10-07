/**
 * Model selection toggle: Anthropic via the Astro gateway (the `provider:
 * anthropic` entry in astropods.yml's models: block) OR the Fabric
 * Anthropic-compatible gateway — never both.
 *
 * ANTHROPIC_API_KEY is required and always configured. FABRIC_BASE_URL /
 * FABRIC_GATEWAY_KEY are optional — but when BOTH are set, Fabric always and
 * only wins, even though ANTHROPIC_API_KEY is also present. Anthropic via the
 * Astro gateway is purely the default used when Fabric isn't configured.
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import type { MastraModelConfig } from '@mastra/core/llm';

const ANTHROPIC_MODEL_ID = 'anthropic/claude-sonnet-4-5';
const FABRIC_MODEL_ID = 'claude-sonnet-4-6';

function createFabricGatewayModel(modelId: string = FABRIC_MODEL_ID): MastraModelConfig {
  const baseURL = process.env.FABRIC_BASE_URL;
  const gatewayKey = process.env.FABRIC_GATEWAY_KEY;
  if (!baseURL || !gatewayKey) {
    throw new Error('FABRIC_BASE_URL and FABRIC_GATEWAY_KEY must both be set to use the Fabric gateway.');
  }

  // @ai-sdk/anthropic's request URL is `${baseURL}/messages` (unlike the raw
  // @anthropic-ai/sdk, which appends `/v1/messages`), so append `/v1` here to
  // land on <FABRIC_BASE_URL>/v1/messages.
  const versionedBaseURL = `${baseURL.replace(/\/+$/, '')}/v1`;

  const gatewayAnthropic = createAnthropic({
    baseURL: versionedBaseURL,
    apiKey: 'unused', // SDK requires a non-empty value; the gateway ignores it.
    headers: { 'X-Gateway-Key': gatewayKey },
  });

  // @ai-sdk/anthropic and @mastra/core each bundle their own copy of the AI
  // SDK provider types, which TS treats as structurally distinct even though
  // they're compatible at runtime — cast at this one boundary rather than
  // fighting the duplicate-package type mismatch.
  return gatewayAnthropic(modelId) as MastraModelConfig;
}

export function resolveModel(): MastraModelConfig {
  if (process.env.FABRIC_BASE_URL && process.env.FABRIC_GATEWAY_KEY) {
    console.log('[model] FABRIC_BASE_URL/FABRIC_GATEWAY_KEY are set — using the Fabric gateway.');
    return createFabricGatewayModel();
  }

  if (process.env.ANTHROPIC_API_KEY) {
    console.log('[model] Fabric not configured — using Anthropic via the Astro gateway.');
    return ANTHROPIC_MODEL_ID;
  }

  throw new Error(
    'No model configured. Set ANTHROPIC_API_KEY (via `ast project configure`) to use Anthropic ' +
      'through the Astro gateway — required — or additionally set both FABRIC_BASE_URL and ' +
      'FABRIC_GATEWAY_KEY to use the Fabric gateway instead.'
  );
}
