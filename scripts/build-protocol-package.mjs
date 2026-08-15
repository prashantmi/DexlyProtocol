import { existsSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const npmCommand = "npm";

function usage() {
  console.log(`Usage: node scripts/build-protocol-package.mjs

Install Dexly Protocol dependencies when needed, then build the shared
@dexly/protocol package into dist/.`);
}

function needsInstall() {
  const nodeModules = join(rootDir, "node_modules");
  const nodeModulesLock = join(nodeModules, ".package-lock.json");
  if (!existsSync(nodeModules) || !existsSync(nodeModulesLock)) return true;

  const installedAt = statSync(nodeModulesLock).mtimeMs;
  return ["package.json", "package-lock.json"].some((name) => {
    const path = join(rootDir, name);
    return existsSync(path) && statSync(path).mtimeMs > installedAt;
  });
}

function run(args) {
  const configuredCli = process.env.npm_execpath;
  const bundledCli = join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
  const cliPath = process.platform === "win32" && configuredCli && existsSync(configuredCli)
    ? configuredCli
    : process.platform === "win32" && existsSync(bundledCli) ? bundledCli : undefined;
  const invocation = cliPath
    ? { command: process.execPath, args: [cliPath, ...args], shell: false }
    : { command: process.platform === "win32" ? "npm.cmd" : npmCommand, args, shell: process.platform === "win32" };
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: invocation.shell,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.argv.slice(2).some((arg) => arg === "-h" || arg === "--help")) {
  usage();
} else {
  if (needsInstall()) {
    console.log("Installing Dexly Protocol dependencies...");
    run(["install"]);
  } else {
    console.log("Using existing Dexly Protocol dependencies.");
  }

  console.log("Building Dexly Protocol...");
  run(["run", "build"]);
}
