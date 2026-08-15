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
  /** Section this thread belongs to (Codex >= 0.147); null/absent when unsectioned. */
  section?: ThreadSection | null;
  /** ISO timestamp the thread entered its current section, when sectioned. */
  sectionEnteredAt?: string | null;
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

export interface CodexModelServiceTier {
  id: string;
  name: string;
  description: string;
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
  /** @deprecated Codex now advertises structured `serviceTiers`. */
  additionalSpeedTiers?: string[] | null;
  serviceTiers?: CodexModelServiceTier[] | null;
  defaultServiceTier?: string | null;
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

export interface CodexAccount {
  type: string;
  email?: string | null;
  planType?: string | null;
  credentialSource?: string | null;
}

export interface CodexAccountReadParams {
  refreshToken: boolean;
}

export interface CodexAccountReadResponse {
  account: CodexAccount | null;
  requiresOpenaiAuth: boolean;
}

export interface CodexChatGptLoginStartParams {
  type: "chatgpt";
  useHostedLoginSuccessPage: boolean;
  appBrand: "codex" | "chatgpt";
}

export interface CodexChatGptLoginStartResponse {
  type: "chatgpt";
  loginId: string;
  authUrl: string;
}

export interface CodexAccountLoginCompletedNotification {
  loginId: string | null;
  success: boolean;
  error: string | null;
}

export interface CodexAccountUpdatedNotification {
  authMode: string | null;
  planType: string | null;
}

export interface CodexInitializeParams {
  clientInfo: {
    name: string;
    title: string | null;
    version: string;
  };
  capabilities: {
    experimentalApi: boolean;
    requestAttestation?: boolean;
    mcpServerOpenaiFormElicitation?: boolean;
    optOutNotificationMethods?: string[] | null;
  } | null;
}

export type CodexInitializedNotification = JsonRpcNotification<"initialized", Record<string, never>>;

export interface CodexThreadStartParams {
  cwd: string | null;
  approvalPolicy: "on-request" | "never";
  sandbox: "workspace-write" | "read-only";
  serviceName: string;
  experimentalRawEvents: boolean;
  persistExtendedHistory: boolean;
  model?: string;
  serviceTier?: string;
}

export interface CodexThreadResumeParams {
  threadId: string;
  cwd?: string | null;
  approvalPolicy: "on-request" | "never";
  sandbox: "workspace-write" | "read-only";
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
  outputSchema?: unknown;
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
      type: "plan";
      id: string;
      text: string;
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
  | {
      type: "contextCompaction";
      id: string;
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

export type TurnPlanStepStatus = "pending" | "inProgress" | "completed";

export interface TurnPlanStep {
  step: string;
  status: TurnPlanStepStatus;
}

export interface TurnPlanUpdatedNotification {
  threadId: string;
  turnId: string;
  explanation: string | null;
  plan: TurnPlanStep[];
}

export interface TokenUsageBreakdown {
  totalTokens: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
  /** Cache-write input tokens (Codex >= 0.147); absent on older CLIs. */
  cacheWriteInputTokens?: number;
}

export interface ThreadTokenUsage {
  total: TokenUsageBreakdown;
  last: TokenUsageBreakdown;
  modelContextWindow: number | null;
}

export interface ThreadTokenUsageUpdatedNotification {
  threadId: string;
  turnId: string;
  tokenUsage: ThreadTokenUsage;
}

export interface ContextCompactedNotification {
  threadId: string;
  turnId: string;
}

export interface ModelReroutedNotification {
  threadId: string;
  turnId: string;
  fromModel: string;
  toModel: string;
  reason: string;
}

export interface WarningNotification {
  threadId: string | null;
  message: string;
}

export interface GuardianWarningNotification {
  threadId: string;
  message: string;
}

export interface DeprecationNoticeNotification {
  summary: string;
  details: string | null;
}

export interface ConfigWarningNotification {
  summary: string;
  details: string | null;
  path?: string;
  range?: unknown;
}

export interface ServerRequestResolvedNotification {
  threadId: string;
  requestId: JsonRpcId;
}

export type CodexServerNotification =
  | JsonRpcNotification<"error", ErrorNotification>
  | JsonRpcNotification<"account/login/completed", CodexAccountLoginCompletedNotification>
  | JsonRpcNotification<"account/updated", CodexAccountUpdatedNotification>
  | JsonRpcNotification<"thread/status/changed", ThreadStatusChangedNotification>
  | JsonRpcNotification<"thread/tokenUsage/updated", ThreadTokenUsageUpdatedNotification>
  | JsonRpcNotification<"thread/compacted", ContextCompactedNotification>
  | JsonRpcNotification<"thread/reverted", ThreadRevertedNotification>
  | JsonRpcNotification<"turn/started", TurnLifecycleNotification>
  | JsonRpcNotification<"turn/completed", TurnLifecycleNotification>
  | JsonRpcNotification<"turn/plan/updated", TurnPlanUpdatedNotification>
  | JsonRpcNotification<"item/started", ItemLifecycleNotification>
  | JsonRpcNotification<"item/completed", ItemLifecycleNotification>
  | JsonRpcNotification<"item/agentMessage/delta", DeltaNotification>
  | JsonRpcNotification<"item/reasoning/summaryTextDelta", ReasoningSummaryTextDeltaNotification>
  | JsonRpcNotification<"item/reasoning/summaryPartAdded", ReasoningSummaryPartAddedNotification>
  | JsonRpcNotification<"item/reasoning/textDelta", DeltaNotification & { contentIndex: number }>
  | JsonRpcNotification<"item/commandExecution/outputDelta", DeltaNotification>
  | JsonRpcNotification<"item/commandExecution/terminalInteraction", TerminalInteractionNotification>
  | JsonRpcNotification<"item/fileChange/outputDelta", DeltaNotification>
  | JsonRpcNotification<"item/mcpToolCall/progress", McpToolCallProgressNotification>
  | JsonRpcNotification<"serverRequest/resolved", ServerRequestResolvedNotification>
  | JsonRpcNotification<"model/rerouted", ModelReroutedNotification>
  | JsonRpcNotification<"warning", WarningNotification>
  | JsonRpcNotification<"guardianWarning", GuardianWarningNotification>
  | JsonRpcNotification<"deprecationNotice", DeprecationNoticeNotification>
  | JsonRpcNotification<"configWarning", ConfigWarningNotification>;

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

// ─────────────────────────────────────────────────────────────────────────────
// Codex 0.147.0 stable feature surfaces.
//
// Wire field names are camelCase to match Codex's `#[serde(rename_all =
// "camelCase")]`. These methods carry no `experimentalApi` gating in Codex, so
// Dexly reaches them with `capabilities.experimentalApi = false`. Requests for
// methods an older CLI does not implement fail with JSON-RPC -32601
// (method not found); transports degrade those to an absent result.
// ─────────────────────────────────────────────────────────────────────────────

// ── Apps API — `app/installed`, `app/read` ───────────────────────────────────

/** One entry from the committed installed-connector runtime snapshot. */
export interface CodexInstalledApp {
  id: string;
  /** Best-effort name from the runtime tool catalog; canonical name via `app/read`. */
  runtimeName: string | null;
  /** Effective enabled state after global/workspace/local/managed config. */
  enabled: boolean;
  /** Enabled AND exposes a model-visible tool allowed by effective policy. */
  callable: boolean;
}

export interface CodexAppsInstalledParams {
  threadId?: string | null;
  forceRefresh?: boolean;
}

export interface CodexAppsInstalledResponse {
  apps: CodexInstalledApp[];
}

/** Display-only tool summary returned by `app/read` when `includeTools` is set. */
export interface CodexAppToolSummary {
  name: string;
  title: string | null;
  description: string;
  isEnabled: boolean;
  disabledReason: string | null;
  isReadOnly: boolean;
}

/** Canonical connector metadata returned by `app/read`. */
export interface CodexConnectorMetadata {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  iconUrlDark: string | null;
  distributionChannel: string | null;
  installUrl: string | null;
  pluginDisplayNames: string[];
  toolSummaries: CodexAppToolSummary[] | null;
}

export interface CodexAppsReadParams {
  /** App ids to read (server caps at 100, dedupes, preserves first-seen order). */
  appIds: string[];
  threadId?: string | null;
  /** Include display-only tool summaries in each connector's metadata. */
  includeTools?: boolean;
}

export interface CodexAppsReadResponse {
  apps: CodexConnectorMetadata[];
  missingAppIds: string[];
}

// ── Account usage — `account/usage/read` ─────────────────────────────────────

export interface CodexAccountTokenUsageSummary {
  lifetimeTokens: number | null;
  peakDailyTokens: number | null;
  longestRunningTurnSec: number | null;
  currentStreakDays: number | null;
  longestStreakDays: number | null;
}

export interface CodexAccountTokenUsageDailyBucket {
  startDate: string;
  tokens: number;
}

export interface CodexAccountUsageParams {
  /** When set, read estimated usage for this thread instead of account-wide. */
  threadId?: string | null;
}

export interface CodexAccountUsageResponse {
  summary: CodexAccountTokenUsageSummary;
  dailyUsageBuckets?: CodexAccountTokenUsageDailyBucket[] | null;
  /** Present only when a thread was requested and its billing route is available. */
  threadUsage?: unknown | null;
}

// ── Thread sections — `threadSection/*`, `thread/section/move` ────────────────
// Foundation types. Dexly has no thread-list browser today, so these have no UI
// surface yet; they keep the contract ready for when one is added.

export interface ThreadSectionAppearance {
  /** Opaque appearance payload (icon/color); shape intentionally loose pending UI. */
  [key: string]: unknown;
}

export interface ThreadSection {
  id: string;
  name: string;
  appearance?: ThreadSectionAppearance | null;
}

export interface ThreadSectionListParams {
  cursor?: string | null;
  limit?: number | null;
}

export interface ThreadSectionListResponse {
  data: ThreadSection[];
  nextCursor: string | null;
}

export interface ThreadSectionCreateParams {
  name: string;
  appearance?: ThreadSectionAppearance | null;
}

export interface ThreadSectionCreateResponse {
  section: ThreadSection;
}

export interface ThreadSectionUpdateParams {
  sectionId: string;
  name: string;
  appearance?: ThreadSectionAppearance | null;
}

export interface ThreadSectionUpdateResponse {
  section: ThreadSection;
}

export interface ThreadSectionDeleteParams {
  sectionId: string;
}

export interface ThreadSectionMoveParams {
  threadId: string;
  /** Destination section, or `null` to remove the thread from its section. */
  sectionId: string | null;
  /** Existing thread to insert before; omit/null appends to the section. */
  beforeThreadId?: string | null;
}

// ── Thread revert — `thread/revert` + `thread/reverted` (Codex >= 0.148) ──────
// Feature-detected: the notification is already relayed and typed here, but the
// UI is gated on codexVersion >= 0.148.0 where `thread/revert` exists.

export interface ThreadRevertParams {
  threadId: string;
  /** Turn excluded from the replacement history, along with every later turn. */
  beforeTurnId: string;
}

export interface ThreadRevertResponse {
  /** Updated thread metadata; `turns` is empty — rehydrate via thread/turns/list. */
  thread: CodexThread;
  turnsBackwardsCursor: string | null;
  itemsBackwardsCursor: string | null;
}

export interface ThreadRevertedNotification {
  threadId: string;
}
