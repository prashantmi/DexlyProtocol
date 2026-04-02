import type { JsonRpcMessage } from "./codex-app-server";

export type DexlyBridgeHostAction =
  | "host/health"
  | "host/connect"
  | "host/disconnect"
  | "host/update"
  | "host/install-codex";
export type DexlyBridgeMessageKind =
  | DexlyBridgeHostAction
  | "host/result"
  | "host/error"
  | "codex/jsonrpc";

export interface DexlyHostCapabilities {
  update: boolean;
  installCodex: boolean;
  rollback: boolean;
}

export interface DexlyHostMetadata {
  hostVersion: string;
  codexVersion: string | null;
  codexInstalled: boolean;
  capabilities: DexlyHostCapabilities;
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

export type DexlyBridgeRequestMap = {
  "host/health": undefined;
  "host/connect": undefined;
  "host/disconnect": undefined;
  "host/update": DexlyHostUpdateParams;
  "host/install-codex": undefined;
};

export type DexlyBridgeResultMap = {
  "host/health": DexlyHostHealthResult;
  "host/connect": DexlyHostConnectResult;
  "host/disconnect": DexlyHostDisconnectResult;
  "host/update": DexlyHostUpdateResult;
  "host/install-codex": DexlyHostInstallCodexResult;
};

type RequestPayloadFor<Action extends DexlyBridgeHostAction> =
  DexlyBridgeRequestMap[Action] extends undefined
    ? { params?: undefined }
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
  details?: unknown;
}

export interface DexlyBridgeJsonRpcMessage {
  kind: "codex/jsonrpc";
  payload: JsonRpcMessage;
}

export type DexlyBridgeClientMessage =
  | DexlyBridgeRequest
  | DexlyBridgeJsonRpcMessage;

export type DexlyBridgeHostMessage =
  | DexlyBridgeResult
  | DexlyBridgeError
  | DexlyBridgeJsonRpcMessage;

export function isDexlyBridgeJsonRpcMessage(value: unknown): value is DexlyBridgeJsonRpcMessage {
  return typeof value === "object"
    && value != null
    && "kind" in value
    && value.kind === "codex/jsonrpc"
    && "payload" in value;
}
