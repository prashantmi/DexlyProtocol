export const DEXLY_AGENT_IDS = ["codex", "opencode", "deepseek", "cursor"] as const;

export type DexlyAgentId = typeof DEXLY_AGENT_IDS[number];

export type DexlyAgentProtocol = "codex-app-server" | "acp-v1";

export type DexlyAgentRuntimeProfile = "code" | "web-readonly";

export type DexlyAgentStructuredOutputMode = "native" | "prompted" | "none";

export type DexlyAgentAuthStrategy = "none" | "cli" | "acp";

export interface DexlyAgentAuthDescriptor {
  strategy: DexlyAgentAuthStrategy;
  required: boolean;
  /** Safe command shown to users; credentials are never transported by Dexly. */
  loginCommand?: string;
  accountScoped: boolean;
}

export interface DexlyAgentCapabilities {
  images: boolean;
  loadSession: boolean;
  resumeSession: boolean;
  sessionConfig: boolean;
  permissions: boolean;
  /** Omitted by older Companions that only support the default code profile. */
  runtimeProfiles?: DexlyAgentRuntimeProfile[];
  /** Omitted by older Companions that do not advertise Web Assist support. */
  structuredOutput?: DexlyAgentStructuredOutputMode;
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
  auth?: DexlyAgentAuthDescriptor;
  reason?: string | null;
  capabilities: DexlyAgentCapabilities;
}

export type DexlyAgentErrorCategory =
  | "invalid_input"
  | "unsupported_capability"
  | "not_installed"
  | "incompatible_version"
  | "authentication"
  | "quota"
  | "network"
  | "process"
  | "bridge"
  | "protocol"
  | "session"
  | "permission"
  | "cancellation"
  | "structured_output"
  | "internal";

export interface DexlyAgentError {
  code: string;
  category: DexlyAgentErrorCategory;
  agentId: DexlyAgentId;
  operation: string;
  runtimeProfile: DexlyAgentRuntimeProfile;
  correlationId: string;
  retryable: boolean;
  retryAfterMs?: number;
  taskStarted: boolean;
  partialOutputPossible: boolean;
  message: string;
  recommendedAction:
    | "retry"
    | "login"
    | "install"
    | "update"
    | "start_fresh"
    | "reconnect"
    | "remain_on_current_agent"
    | "none";
  /** Bounded, redacted troubleshooting context. Never contains prompts or credentials. */
  diagnostic?: string;
}

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
  | { type: "assistant/delta"; agentId: DexlyAgentId; sessionId: string; turnId: string; text: string }
  | { type: "thought/delta"; agentId: DexlyAgentId; sessionId: string; turnId: string; text: string }
  | { type: "tool/update"; agentId: DexlyAgentId; sessionId: string; turnId: string; toolCallId: string; title: string; status?: string; detail?: unknown }
  | { type: "plan/update"; agentId: DexlyAgentId; sessionId: string; turnId: string; entries: Array<{ content: string; status: string }> }
  | { type: "usage/update"; agentId: DexlyAgentId; sessionId: string; turnId: string; used: number; size: number }
  | { type: "permission/request"; agentId: DexlyAgentId; sessionId: string; turnId: string; requestId: string | number; toolCallId: string; title: string; detail?: unknown; choices: DexlyAgentApprovalChoice[] }
  | { type: "turn/completed"; agentId: DexlyAgentId; sessionId: string; turnId: string; stopReason: string; finalText: string }
  | { type: "warning"; agentId: DexlyAgentId; message: string; fatal: boolean };

export function isDexlyAgentId(value: unknown): value is DexlyAgentId {
  return typeof value === "string"
    && (DEXLY_AGENT_IDS as readonly string[]).includes(value);
}

export function isDexlyAgentRuntimeProfile(value: unknown): value is DexlyAgentRuntimeProfile {
  return value === "code" || value === "web-readonly";
}
