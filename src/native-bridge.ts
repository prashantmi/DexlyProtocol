import type { JsonRpcMessage } from "./codex-app-server";
import type {
  DexlyAgentAuthenticationStatus,
  DexlyAgentDescriptor,
  DexlyAgentId,
  DexlyAgentRuntimeProfile
} from "./agents";
import { isDexlyAgentId, isDexlyAgentRuntimeProfile } from "./agents";

export type DexlyBridgeHostAction =
  | "host/health"
  | "host/connect"
  | "host/disconnect"
  | "host/update"
  | "host/authenticate-agent"
  | "host/install-agent"
  | "host/install-codex";
export type DexlyBridgeMessageKind =
  | DexlyBridgeHostAction
  | "host/result"
  | "host/error"
  | "agent/jsonrpc"
  | "agent/jsonrpc-chunk"
  | "codex/jsonrpc"
  | "codex/jsonrpc-chunk";

export interface DexlyHostCapabilities {
  update: boolean;
  installCodex: boolean;
  rollback: boolean;
  agents?: boolean;
  installAgent?: boolean;
  authenticateAgent?: boolean;
}

export interface DexlyHostMetadata {
  hostVersion: string;
  codexVersion: string | null;
  codexInstalled: boolean;
  capabilities: DexlyHostCapabilities;
  /** Present on agent-aware companions. Omission identifies a legacy Codex-only host. */
  agentProtocolVersion?: number;
  agents?: DexlyAgentDescriptor[];
  connectedAgentId?: DexlyAgentId | null;
  connectedAgentProfile?: DexlyAgentRuntimeProfile | null;
  /** Stable Companion-owned cwd for profile-scoped sessions such as browser-only Web Assist. */
  profileWorkingDirectory?: string | null;
}

export interface DexlyHostHealthResult extends DexlyHostMetadata {
  ready: boolean;
}

export interface DexlyHostConnectResult extends DexlyHostMetadata {
  connected: true;
}

export interface DexlyHostDisconnectResult {
  disconnected: true;
}

export interface DexlyHostConnectParams {
  agentId?: DexlyAgentId;
  profile?: DexlyAgentRuntimeProfile;
}

export interface DexlyHostInstallAgentParams {
  agentId: DexlyAgentId;
}

export interface DexlyHostAuthenticateAgentParams {
  agentId: DexlyAgentId;
}

export interface DexlyHostUpdateParams {
  distTag: string;
  version?: string | null;
}

export interface DexlyHostUpdateResult extends DexlyHostMetadata {
  updated: true;
  previousVersion: string;
  targetSpecifier: string;
}

export interface DexlyHostInstallCodexResult extends DexlyHostMetadata {
  installed: true;
  installCommand: string;
}

export interface DexlyHostInstallAgentResult extends DexlyHostMetadata {
  installed: true;
  agentId: DexlyAgentId;
  installCommand: string;
}

export interface DexlyHostAuthenticateAgentResult extends DexlyHostMetadata {
  agentId: DexlyAgentId;
  authenticationStatus: DexlyAgentAuthenticationStatus;
}

export type DexlyBridgeRequestMap = {
  "host/health": undefined;
  "host/connect": DexlyHostConnectParams | undefined;
  "host/disconnect": undefined;
  "host/update": DexlyHostUpdateParams;
  "host/authenticate-agent": DexlyHostAuthenticateAgentParams;
  "host/install-agent": DexlyHostInstallAgentParams;
  "host/install-codex": undefined;
};

export type DexlyBridgeResultMap = {
  "host/health": DexlyHostHealthResult;
  "host/connect": DexlyHostConnectResult;
  "host/disconnect": DexlyHostDisconnectResult;
  "host/update": DexlyHostUpdateResult;
  "host/authenticate-agent": DexlyHostAuthenticateAgentResult;
  "host/install-agent": DexlyHostInstallAgentResult;
  "host/install-codex": DexlyHostInstallCodexResult;
};

type RequestPayloadFor<Action extends DexlyBridgeHostAction> =
  undefined extends DexlyBridgeRequestMap[Action]
    ? { params?: Exclude<DexlyBridgeRequestMap[Action], undefined> }
    : { params: DexlyBridgeRequestMap[Action] };

export type DexlyBridgeRequest<Action extends DexlyBridgeHostAction = DexlyBridgeHostAction> =
  Action extends DexlyBridgeHostAction
    ? {
      kind: Action;
      requestId: string;
    } & RequestPayloadFor<Action>
    : never;

export interface DexlyBridgeResult<Action extends DexlyBridgeHostAction = DexlyBridgeHostAction> {
  kind: "host/result";
  action: Action;
  requestId: string;
  result: DexlyBridgeResultMap[Action];
}

export interface DexlyBridgeError {
  kind: "host/error";
  action: DexlyBridgeHostAction | null;
  requestId: string | null;
  code: string;
  message: string;
  /** Older companions omit this field; clients must treat omission as fatal. */
  fatal?: boolean;
  details?: unknown;
}

export interface DexlyBridgeJsonRpcMessage {
  kind: "codex/jsonrpc";
  payload: JsonRpcMessage;
}

export interface DexlyBridgeAgentJsonRpcMessage {
  kind: "agent/jsonrpc";
  agentId: DexlyAgentId;
  payload: JsonRpcMessage;
}

/**
 * One bridge-safe fragment of a serialized JSON-RPC payload. Chrome limits
 * native-host-to-extension messages to 1 MiB, so the companion uses this
 * envelope whenever a complete `codex/jsonrpc` envelope would exceed it.
 */
export interface DexlyBridgeJsonRpcChunk {
  kind: "codex/jsonrpc-chunk";
  messageId: string;
  index: number;
  total: number;
  data: string;
}


export interface DexlyBridgeAgentJsonRpcChunk {
  kind: "agent/jsonrpc-chunk";
  agentId: DexlyAgentId;
  messageId: string;
  index: number;
  total: number;
  data: string;
}

export type DexlyBridgeClientMessage =
  | DexlyBridgeRequest
  | DexlyBridgeAgentJsonRpcMessage
  | DexlyBridgeJsonRpcMessage;

export type DexlyBridgeHostMessage =
  | DexlyBridgeResult
  | DexlyBridgeError
  | DexlyBridgeAgentJsonRpcMessage
  | DexlyBridgeAgentJsonRpcChunk
  | DexlyBridgeJsonRpcMessage
  | DexlyBridgeJsonRpcChunk;

export function isDexlyBridgeRequest(value: unknown): value is DexlyBridgeRequest {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { kind?: unknown; requestId?: unknown; params?: unknown };
  if (typeof candidate.requestId !== "string" || candidate.requestId.length === 0) return false;
  switch (candidate.kind) {
    case "host/health":
    case "host/disconnect":
    case "host/install-codex":
      return candidate.params === undefined;
    case "host/connect":
      return candidate.params === undefined || (
        typeof candidate.params === "object"
        && candidate.params != null
        && ((candidate.params as { agentId?: unknown }).agentId === undefined
          || isDexlyAgentId((candidate.params as { agentId?: unknown }).agentId))
        && ((candidate.params as { profile?: unknown }).profile === undefined
          || isDexlyAgentRuntimeProfile((candidate.params as { profile?: unknown }).profile))
      );
    case "host/install-agent":
    case "host/authenticate-agent":
      return typeof candidate.params === "object"
        && candidate.params != null
        && isDexlyAgentId((candidate.params as { agentId?: unknown }).agentId);
    case "host/update":
      return typeof candidate.params === "object"
        && candidate.params != null
        && typeof (candidate.params as { distTag?: unknown }).distTag === "string";
    default:
      return false;
  }
}

export function isDexlyBridgeClientMessage(value: unknown): value is DexlyBridgeClientMessage {
  return isDexlyBridgeRequest(value)
    || isDexlyBridgeJsonRpcMessage(value)
    || isDexlyBridgeAgentJsonRpcMessage(value);
}

export function isDexlyBridgeJsonRpcMessage(value: unknown): value is DexlyBridgeJsonRpcMessage {
  return typeof value === "object"
    && value != null
    && "kind" in value
    && value.kind === "codex/jsonrpc"
    && "payload" in value;
}

export function isDexlyBridgeAgentJsonRpcMessage(value: unknown): value is DexlyBridgeAgentJsonRpcMessage {
  return typeof value === "object"
    && value != null
    && "kind" in value
    && value.kind === "agent/jsonrpc"
    && "agentId" in value
    && isDexlyAgentId(value.agentId)
    && "payload" in value;
}

export function isDexlyBridgeJsonRpcChunk(value: unknown): value is DexlyBridgeJsonRpcChunk {
  return typeof value === "object"
    && value != null
    && "kind" in value
    && value.kind === "codex/jsonrpc-chunk"
    && "messageId" in value
    && typeof value.messageId === "string"
    && "index" in value
    && typeof value.index === "number"
    && "total" in value
    && typeof value.total === "number"
    && "data" in value
    && typeof value.data === "string";
}


export function isDexlyBridgeAgentJsonRpcChunk(value: unknown): value is DexlyBridgeAgentJsonRpcChunk {
  return typeof value === "object"
    && value != null
    && "kind" in value
    && value.kind === "agent/jsonrpc-chunk"
    && "agentId" in value
    && isDexlyAgentId(value.agentId)
    && "messageId" in value
    && typeof value.messageId === "string"
    && "index" in value
    && typeof value.index === "number"
    && "total" in value
    && typeof value.total === "number"
    && "data" in value
    && typeof value.data === "string";
}
