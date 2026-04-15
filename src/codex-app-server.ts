export type JsonRpcId = string | number;

export interface JsonRpcRequest<Method extends string = string, Params = unknown> {
  jsonrpc: "2.0";
  id: JsonRpcId;
  method: Method;
  params: Params;
}

export interface JsonRpcNotification<Method extends string = string, Params = unknown> {
  jsonrpc: "2.0";
  method: Method;
  params: Params;
}

export interface JsonRpcSuccessResponse<Result = unknown> {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result: Result;
}

export interface JsonRpcErrorShape {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  id: JsonRpcId | null;
  error: JsonRpcErrorShape;
}

export interface InitializeResponse {
  userAgent: string;
}

export interface CodexThread {
  id: string;
  preview: string;
  cwd: string;
  name: string | null;
}

export type TurnStatus = "completed" | "interrupted" | "failed" | "inProgress";

export interface CodexTurn {
  id: string;
  status: TurnStatus;
  error: unknown;
}

export interface ThreadStartOrResumeResponse {
  thread: CodexThread;
  cwd: string;
}

export interface TurnStartResponse {
  turn: CodexTurn;
}

export interface CodexModelReasoningEffortOption {
  reasoningEffort: string;
  description?: string | null;
}

export interface CodexModelCatalogEntry {
  id: string;
  model: string;
  displayName?: string | null;
  hidden?: boolean;
  defaultReasoningEffort?: string | null;
  supportedReasoningEfforts?: CodexModelReasoningEffortOption[] | null;
  inputModalities?: string[] | null;
  supportsPersonality?: boolean;
  isDefault?: boolean;
  additionalSpeedTiers?: string[] | null;
  upgrade?: string | null;
  upgradeInfo?: unknown | null;
}

export interface CodexModelListParams {
  cursor?: string | null;
  limit?: number | null;
  includeHidden?: boolean;
}

export interface CodexModelListResponse {
  data: CodexModelCatalogEntry[];
  nextCursor: string | null;
}

export interface CodexInitializeParams {
  clientInfo: {
    name: string;
    title: string | null;
    version: string;
  };
  capabilities: {
    experimentalApi: boolean;
    optOutNotificationMethods?: string[] | null;
  } | null;
}

export type CodexInitializedNotification = JsonRpcNotification<"initialized", Record<string, never>>;

export interface CodexThreadStartParams {
  cwd: string;
  approvalPolicy: "on-request";
  sandbox: "workspace-write";
  serviceName: string;
  experimentalRawEvents: boolean;
  persistExtendedHistory: boolean;
  model?: string;
  serviceTier?: string;
}

export interface CodexThreadResumeParams {
  threadId: string;
  cwd?: string;
  approvalPolicy: "on-request";
  sandbox: "workspace-write";
  persistExtendedHistory: boolean;
  model?: string;
  serviceTier?: string;
}

export interface CodexTurnStartParams {
  threadId: string;
  input: Array<
    | {
        type: "text";
        text: string;
        text_elements: [];
      }
    | {
        type: "image";
        url: string;
      }
    | {
        type: "local_image";
        path: string;
      }
  >;
  model?: string;
  serviceTier?: string;
  effort?: string;
}

export interface CodexTurnInterruptParams {
  threadId: string;
  turnId: string;
}

export type MessagePhase = "commentary" | "final_answer";

export type CommandAction =
  | {
      type: "read";
      command: string;
      name: string;
      path: string;
    }
  | {
      type: "listFiles";
      command: string;
      path: string | null;
    }
  | {
      type: "search";
      command: string;
      query: string | null;
      path: string | null;
    }
  | {
      type: "unknown";
      command: string;
    };

export type WebSearchAction =
  | {
      type: "search";
      query: string | null;
      queries: string[] | null;
    }
  | {
      type: "openPage";
      url: string | null;
    }
  | {
      type: "findInPage";
      url: string | null;
      pattern: string | null;
    }
  | {
      type: "other";
    };

export type CommandExecutionSource =
  | "agent"
  | "userShell"
  | "unifiedExecStartup"
  | "unifiedExecInteraction";

export type CommandExecutionStatus = "inProgress" | "completed" | "failed" | "declined";

export type PatchChangeKind =
  | { type: "add" }
  | { type: "delete" }
  | { type: "update"; move_path: string | null };

export interface FileUpdateChange {
  path: string;
  kind: PatchChangeKind;
  diff: string;
}

export type PatchApplyStatus = "inProgress" | "completed" | "failed" | "declined";
export type McpToolCallStatus = "inProgress" | "completed" | "failed";
export type DynamicToolCallStatus = "inProgress" | "completed" | "failed";

type GenericThreadItem = {
  type: string;
  id: string;
  [key: string]: unknown;
};

export type ThreadItem =
  | {
      type: "agentMessage";
      id: string;
      text: string;
      phase: MessagePhase | null;
      memoryCitation: unknown | null;
    }
  | {
      type: "reasoning";
      id: string;
      summary: string[];
      content: string[];
    }
  | {
      type: "commandExecution";
      id: string;
      command: string;
      cwd: string;
      processId: string | null;
      source: CommandExecutionSource;
      status: CommandExecutionStatus;
      commandActions: CommandAction[];
      aggregatedOutput: string | null;
      exitCode: number | null;
      durationMs: number | null;
    }
  | {
      type: "fileChange";
      id: string;
      changes: FileUpdateChange[];
      status: PatchApplyStatus;
    }
  | {
      type: "mcpToolCall";
      id: string;
      server: string;
      tool: string;
      status: McpToolCallStatus;
      arguments: unknown;
      result: unknown | null;
      error: unknown | null;
      durationMs: number | null;
    }
  | {
      type: "dynamicToolCall";
      id: string;
      tool: string;
      arguments: unknown;
      status: DynamicToolCallStatus;
      contentItems: unknown[] | null;
      success: boolean | null;
      durationMs: number | null;
    }
  | {
      type: "collabAgentToolCall";
      id: string;
      tool: string;
      status: string;
      senderThreadId: string;
      receiverThreadIds: string[];
      prompt: string | null;
      model: string | null;
      reasoningEffort: string | null;
      agentsStates: Record<string, unknown>;
    }
  | {
      type: "webSearch";
      id: string;
      query: string;
      action: WebSearchAction | null;
    }
  | {
      type: "imageView";
      id: string;
      path: string;
    }
  | GenericThreadItem;

export interface ThreadStatusChangedNotification {
  threadId: string;
  status:
    | { type: "notLoaded" }
    | { type: "idle" }
    | { type: "systemError" }
    | { type: "active"; activeFlags: string[] };
}

export interface TurnLifecycleNotification {
  threadId: string;
  turn: CodexTurn;
}

export interface ItemLifecycleNotification {
  threadId: string;
  turnId: string;
  item: ThreadItem;
}

export interface DeltaNotification {
  threadId: string;
  turnId: string;
  itemId: string;
  delta: string;
}

export interface ReasoningSummaryTextDeltaNotification extends DeltaNotification {
  summaryIndex: number;
}

export interface ReasoningSummaryPartAddedNotification {
  threadId: string;
  turnId: string;
  itemId: string;
  summaryIndex: number;
}

export interface McpToolCallProgressNotification {
  threadId: string;
  turnId: string;
  itemId: string;
  message: string;
}

export interface TerminalInteractionNotification {
  threadId: string;
  turnId: string;
  itemId: string;
  processId: string;
  stdin: string;
}

export interface ErrorNotification {
  message: string;
}

export type CodexServerNotification =
  | JsonRpcNotification<"error", ErrorNotification>
  | JsonRpcNotification<"thread/status/changed", ThreadStatusChangedNotification>
  | JsonRpcNotification<"turn/started", TurnLifecycleNotification>
  | JsonRpcNotification<"turn/completed", TurnLifecycleNotification>
  | JsonRpcNotification<"item/started", ItemLifecycleNotification>
  | JsonRpcNotification<"item/completed", ItemLifecycleNotification>
  | JsonRpcNotification<"item/agentMessage/delta", DeltaNotification>
  | JsonRpcNotification<"item/reasoning/summaryTextDelta", ReasoningSummaryTextDeltaNotification>
  | JsonRpcNotification<"item/reasoning/summaryPartAdded", ReasoningSummaryPartAddedNotification>
  | JsonRpcNotification<"item/reasoning/textDelta", DeltaNotification & { contentIndex: number }>
  | JsonRpcNotification<"item/commandExecution/outputDelta", DeltaNotification>
  | JsonRpcNotification<"item/commandExecution/terminalInteraction", TerminalInteractionNotification>
  | JsonRpcNotification<"item/fileChange/outputDelta", DeltaNotification>
  | JsonRpcNotification<"item/mcpToolCall/progress", McpToolCallProgressNotification>;

export interface CommandApprovalParams {
  threadId: string;
  turnId: string;
  itemId: string;
  approvalId?: string | null;
  reason?: string | null;
  command?: string | null;
  cwd?: string | null;
  commandActions?: CommandAction[] | null;
  availableDecisions?: Array<"accept" | "acceptForSession" | "decline" | "cancel"> | null;
}

export interface FileChangeApprovalParams {
  threadId: string;
  turnId: string;
  itemId: string;
  reason?: string | null;
  grantRoot?: string | null;
}

export interface LegacyExecApprovalParams {
  conversationId: string;
  approvalId: string | null;
  command: string[];
  cwd: string;
  reason: string | null;
}

export interface LegacyPatchApprovalParams {
  conversationId: string;
  callId: string;
  reason: string | null;
  grantRoot: string | null;
}

export type CodexServerRequest =
  | JsonRpcRequest<"item/commandExecution/requestApproval", CommandApprovalParams>
  | JsonRpcRequest<"item/fileChange/requestApproval", FileChangeApprovalParams>
  | JsonRpcRequest<"execCommandApproval", LegacyExecApprovalParams>
  | JsonRpcRequest<"applyPatchApproval", LegacyPatchApprovalParams>;

export type JsonRpcInboundMessage =
  | JsonRpcSuccessResponse
  | JsonRpcErrorResponse
  | CodexServerNotification
  | CodexServerRequest;

export type JsonRpcOutboundMessage =
  | JsonRpcSuccessResponse
  | JsonRpcErrorResponse
  | JsonRpcRequest
  | JsonRpcNotification;

export type JsonRpcMessage =
  | JsonRpcInboundMessage
  | JsonRpcOutboundMessage;
