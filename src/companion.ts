export const DEXLY_COMPANION_HOST_NAME = "ai.dexly.companion";
export const DEXLY_COMPANION_DISPLAY_NAME = "Dexly Companion";
export const DEXLY_COMPANION_PACKAGE_NAME = "@dexlyai/dexly";
export const DEXLY_COMPANION_EXECUTABLE_NAME = "dexly";
export const DEXLY_NATIVE_CONNECTION_ENDPOINT = "native://ai.dexly.companion";
export const DEXLY_COMPANION_INSTALL_COMMAND = "npx -y @dexlyai/dexly install";
export const DEXLY_COMPANION_DOCTOR_COMMAND = "npx -y @dexlyai/dexly doctor";
export const DEXLY_COMPANION_UPGRADE_COMMAND = "npx -y @dexlyai/dexly upgrade";
export const DEXLY_COMPANION_GLOBAL_INSTALL_COMMAND =
  "npm i -g @dexlyai/dexly && dexly install";
export const DEXLY_COMPANION_CONNECT_COOLDOWN_MS = 15_000;
export const DEXLY_CODEX_INSTALL_COMMAND = "npm install -g @openai/codex";
export const DEXLY_CODEX_UPGRADE_COMMAND = "codex --upgrade";
export const DEXLY_CODEX_INSTALL_DOCS_URL =
  "https://help.openai.com/en/articles/11096431-openai-codex-ci-getting-started";

export type DexlyExtensionBuildChannel = "development" | "production";
export type DexlyCompanionReleaseChannel = "latest" | "beta" | "canary";

// These pinned unpacked-extension public keys keep Dexly's local development and
// production-candidate builds on stable Chrome extension ids for native messaging.
export const DEXLY_DEV_EXTENSION_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6fpo7R5tslk/4402QrobrFaQUyW2jk+cgG60FE51YtcQUWtdI8WEyIZBg7bTkpwjt/cvcCWg6B5P/iOZNYoq0o3RxyeqT+8IjuYA0d2kYUaCOoshPsLdEvLTTr3SQ1bg0r2naivw92KxVgZ2fcZuS4kNy6qYhBCWitvTLvDVCnjRN13UT9buskxnsv0Cr+kh7vr/YXA2Boy2jwQyZXEDg9FvnSJF5yEAK6GLzlkvfIKXifxBSMdNaOVp8hKOxR9WjFTotBwZ6mgJXKCNgG+7Xd54xkWRaomU7CEohfvkmmxM9gpJ3S1VqmauogSbkzwCcJQJ1csdU/7TWQ4+hOuKLQIDAQAB";
export const DEXLY_DEV_EXTENSION_ID = "mjihblbjfhdhaidkanpjbnmmcljbafdn";
export const DEXLY_PROD_EXTENSION_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmxkxUCWY3dbeEhjPxW7hOstyhtteCX3blvOTTGoGjju2p+je8eNVo7YDSqlgwRvOQw5N9LWmwb5Ui9wwVhQtLWyYqqq4aTVIAQhUhPDG6gRAUlLMXb/8e+ErWVx707d+aOVTgdc41qA2TVeUelVv/ARjcHL+xcxtk9pcmEMUGnWcZ1kPVx5FTQlLvEpFLVFsTMA6sff/6ba00/S1J28rEUdo2I61Dqku3ceMe3wNmLO4LJ9dj4dLxuYzpF/zH9vEVPWlYgyZY/NGadaAv1rxW4BSboqEOAK54vzcd5FfbxmvuYcRCVyN2A6WRU6sFUFpNrlzTOl+PpogNh+pa2qgxwIDAQAB";
export const DEXLY_PROD_EXTENSION_ID = "mkgnndfbolkjpiijcpkhmgjjhgcibdnp";

export const DEXLY_EXTENSION_IDENTITIES = {
  development: {
    channel: "development",
    label: "development",
    extensionId: DEXLY_DEV_EXTENSION_ID,
    publicKey: DEXLY_DEV_EXTENSION_PUBLIC_KEY
  },
  production: {
    channel: "production",
    label: "production",
    extensionId: DEXLY_PROD_EXTENSION_ID,
    publicKey: DEXLY_PROD_EXTENSION_PUBLIC_KEY
  }
} as const satisfies Record<
  DexlyExtensionBuildChannel,
  {
    channel: DexlyExtensionBuildChannel;
    label: string;
    extensionId: string;
    publicKey: string;
  }
>;

export const DEXLY_FIXED_EXTENSION_IDS = [
  DEXLY_EXTENSION_IDENTITIES.development.extensionId,
  DEXLY_EXTENSION_IDENTITIES.production.extensionId
] as const;

export const DEXLY_DEFAULT_RELEASE_CHANNEL_BY_BUILD = {
  development: "beta",
  production: "latest"
} as const satisfies Record<DexlyExtensionBuildChannel, DexlyCompanionReleaseChannel>;

export function resolveDexlyExtensionBuildChannel(value: string | null | undefined): DexlyExtensionBuildChannel {
  switch (value?.trim().toLowerCase()) {
    case "dev":
    case "development":
      return "development";
    case "prod":
    case "production":
      return "production";
    default:
      return "production";
  }
}

export function getDexlyExtensionIdentity(channel: DexlyExtensionBuildChannel) {
  return DEXLY_EXTENSION_IDENTITIES[channel];
}

export function isDexlyFixedExtensionId(extensionId: string | null | undefined): boolean {
  return typeof extensionId === "string"
    && DEXLY_FIXED_EXTENSION_IDS.some((candidate) => candidate === extensionId);
}

export function toChromeExtensionOrigin(extensionId: string): string {
  return `chrome-extension://${extensionId}/`;
}

export function resolveDexlyExtensionBuildChannelFromExtensionId(
  extensionId: string | null | undefined
): DexlyExtensionBuildChannel {
  return extensionId === DEXLY_DEV_EXTENSION_ID ? "development" : "production";
}

export function normalizeCompanionReleaseChannel(
  value: string | null | undefined
): DexlyCompanionReleaseChannel | null {
  switch (value?.trim().toLowerCase()) {
    case "latest":
    case "beta":
    case "canary":
      return value.trim().toLowerCase() as DexlyCompanionReleaseChannel;
    default:
      return null;
  }
}

export const DEXLY_FIXED_ALLOWED_ORIGINS = DEXLY_FIXED_EXTENSION_IDS.map(toChromeExtensionOrigin);

export const DEFAULT_DIRECT_WEBSOCKET_ENDPOINT = "ws://127.0.0.1:4500";
