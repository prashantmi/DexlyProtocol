export type DexlyAgentId = "codex" | "opencode";

export type DexlyAgentProtocol = "codex-app-server" | "acp-v1";

export type DexlyAgentRuntimeProfile = "code" | "web-readonly";

export type DexlyAgentStructuredOutputMode = "native" | "prompted" | "none";

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
  reason?: string | null;
  capabilities: DexlyAgentCapabilities;
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
  return value === "codex" || value === "opencode";
}

export function isDexlyAgentRuntimeProfile(value: unknown): value is DexlyAgentRuntimeProfile {
  return value === "code" || value === "web-readonly";
}
