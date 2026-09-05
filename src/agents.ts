export const DEXLY_AGENT_IDS = ["codex", "opencode", "deepseek", "cursor"] as const;

export type DexlyAgentId = typeof DEXLY_AGENT_IDS[number];

export type DexlyAgentProtocol = "codex-app-server" | "acp-v1";

export type DexlyAgentRuntimeProfile = "code" | "web-readonly";

export type DexlyAgentStructuredOutputMode = "native" | "prompted" | "none";

export type DexlyAgentMessageDelivery = "delta" | "committed-message";

export type DexlyAgentPermissionScope = "once" | "persistent";

export type DexlyAgentDistribution = "managed" | "user-managed";

/** Authentication state observed by the Companion without retaining account identity. */
export type DexlyAgentAuthenticationStatus = "unknown" | "required" | "authenticated";

export interface DexlyAgentWebSafety {
  readOnly: "native-sandbox" | "agent-mode" | "isolated-policy" | "none";
  isolatedProcess: boolean;
  rejectPermissions: boolean;
  allowMcpServers: boolean;
}

export interface DexlyAgentCapabilities {
  images: boolean;
  loadSession: boolean;
  resumeSession: boolean;
  sessionConfig: boolean;
  permissions: boolean;
  /** How assistant content is delivered by this provider. Defaults to delta. */
  messageDelivery?: DexlyAgentMessageDelivery;
  listSessions?: boolean;
  closeSession?: boolean;
  cancelTurn?: boolean;
  modes?: boolean;
  usage?: boolean;
  authentication?: boolean;
  permissionScopes?: DexlyAgentPermissionScope[];
  userQuestions?: boolean;
  planApproval?: boolean;
  providerNotifications?: boolean;
  /** Omitted by older Companions that only support the default code profile. */
  runtimeProfiles?: DexlyAgentRuntimeProfile[];
  /** Omitted by older Companions that do not advertise Web Assist support. */
  structuredOutput?: DexlyAgentStructuredOutputMode;
  /** Present only when the provider/profile passed Dexly's Web safety contract. */
  webSafety?: DexlyAgentWebSafety;
}

export interface DexlyAgentDescriptor {
  id: DexlyAgentId;
  label: string;
  protocol: DexlyAgentProtocol;
  beta: boolean;
  installed: boolean;
  available: boolean;
  compatible: boolean;
  installable: boolean;
  version: string | null;
  requiredVersion: string | null;
  distribution?: DexlyAgentDistribution;
  authenticationStatus?: DexlyAgentAuthenticationStatus;
  authCommand?: string | null;
  installCommand?: string | null;
  minimumNodeVersion?: string | null;
  reason?: string | null;
  capabilities: DexlyAgentCapabilities;
}

export interface DexlyAgentCatalogEntry {
  id: DexlyAgentId;
  label: string;
  protocol: DexlyAgentProtocol;
  beta: boolean;
  distribution: DexlyAgentDistribution;
  runtimeProfiles: DexlyAgentRuntimeProfile[];
}

export const DEXLY_AGENT_CATALOG: Readonly<Record<DexlyAgentId, DexlyAgentCatalogEntry>> = Object.freeze({
  codex: {
    id: "codex",
    label: "Codex",
    protocol: "codex-app-server",
    beta: false,
    distribution: "managed",
    runtimeProfiles: ["code"]
  },
  opencode: {
    id: "opencode",
    label: "OpenCode",
    protocol: "acp-v1",
    beta: true,
    distribution: "managed",
    runtimeProfiles: ["code", "web-readonly"]
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek Harness",
    protocol: "acp-v1",
    beta: true,
    distribution: "managed",
    runtimeProfiles: ["code", "web-readonly"]
  },
  cursor: {
    id: "cursor",
    label: "Cursor Agent",
    protocol: "acp-v1",
    beta: true,
    distribution: "user-managed",
    runtimeProfiles: ["code", "web-readonly"]
  }
});

export interface DexlyAgentSessionRef {
  sessionId: string;
  cwd: string;
}

export type DexlyAgentConfigValue = string | boolean;

export interface DexlyAgentConfigOptionValue {
  value: DexlyAgentConfigValue;
  name: string;
  description?: string | null;
}

export interface DexlyAgentConfigOption {
  id: string;
  name: string;
  description?: string | null;
  category?: "model" | "mode" | "thought_level" | "other" | null;
  type: "select" | "boolean";
  currentValue: DexlyAgentConfigValue;
  options?: DexlyAgentConfigOptionValue[];
}

export interface DexlyAgentApprovalChoice {
  id: string;
  label: string;
  outcome: "allow" | "reject";
  scope: "once" | "persistent";
}

export type DexlyAgentEvent =
  | { type: "connection"; agentId: DexlyAgentId; connected: boolean; message?: string }
  | { type: "session/config"; agentId: DexlyAgentId; sessionId: string; options: DexlyAgentConfigOption[] }
  | { type: "assistant/delta"; agentId: DexlyAgentId; sessionId: string; turnId: string; text: string; delivery?: DexlyAgentMessageDelivery }
  | { type: "thought/delta"; agentId: DexlyAgentId; sessionId: string; turnId: string; text: string }
  | { type: "tool/update"; agentId: DexlyAgentId; sessionId: string; turnId: string; toolCallId: string; title: string; status?: string; detail?: unknown }
  | { type: "plan/update"; agentId: DexlyAgentId; sessionId: string; turnId: string; entries: Array<{ content: string; status: string }> }
  | { type: "usage/update"; agentId: DexlyAgentId; sessionId: string; turnId: string; used: number; size: number }
  | { type: "permission/request"; agentId: DexlyAgentId; sessionId: string; turnId: string; requestId: string | number; toolCallId: string; title: string; detail?: unknown; choices: DexlyAgentApprovalChoice[] }
  | { type: "turn/completed"; agentId: DexlyAgentId; sessionId: string; turnId: string; stopReason: string; finalText: string }
  | { type: "warning"; agentId: DexlyAgentId; message: string; fatal: boolean };

export function isDexlyAgentId(value: unknown): value is DexlyAgentId {
  return typeof value === "string" && DEXLY_AGENT_IDS.some((agentId) => agentId === value);
}

export function isDexlyAgentRuntimeProfile(value: unknown): value is DexlyAgentRuntimeProfile {
  return value === "code" || value === "web-readonly";
}

export function isDexlyAcpAgentId(value: DexlyAgentId): boolean {
  return DEXLY_AGENT_CATALOG[value].protocol === "acp-v1";
}

export function dexlyAgentLabel(agentId: DexlyAgentId): string {
  return DEXLY_AGENT_CATALOG[agentId].label;
}

export function dexlyAgentSupportsProfile(
  agentId: DexlyAgentId,
  profile: DexlyAgentRuntimeProfile
): boolean {
  return DEXLY_AGENT_CATALOG[agentId].runtimeProfiles.includes(profile);
}
