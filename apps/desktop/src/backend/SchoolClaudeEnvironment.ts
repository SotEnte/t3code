import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

export function schoolClaudeEnvironment(
  platform: NodeJS.Platform,
  environment: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  if (platform !== "win32" || !environment.LOCALAPPDATA) return {};

  const directory = NodePath.join(environment.LOCALAPPDATA, "SchoolClaudeClient");
  const claude = NodePath.join(directory, "claude.exe");
  const bash = NodePath.join(directory, "git", "bin", "bash.exe");
  if (!NodeFS.existsSync(claude) || !NodeFS.existsSync(bash)) return {};

  let launcher: string;
  try {
    launcher = NodeFS.readFileSync(NodePath.join(directory, "School Claude.cmd"), "utf8");
  } catch {
    return {};
  }

  const token = /^set "ANTHROPIC_AUTH_TOKEN=([^"\r\n]+)"\r?$/m.exec(launcher)?.[1];
  const baseUrl = /^set "ANTHROPIC_BASE_URL=([^"\r\n]+)"\r?$/m.exec(launcher)?.[1];
  if (!token || !/^[A-Za-z0-9_-]{32,}$/.test(token) || !baseUrl) return {};
  try {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return {};
  } catch {
    return {};
  }

  return {
    ANTHROPIC_API_KEY: "",
    ANTHROPIC_AUTH_TOKEN: token,
    ANTHROPIC_BASE_URL: baseUrl,
    CLAUDE_CONFIG_DIR: NodePath.join(directory, "claude-config"),
    CLAUDE_CODE_GIT_BASH_PATH: bash,
    CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY: "1",
    PATH: [directory, NodePath.join(directory, "git", "cmd"), environment.PATH ?? ""].join(";"),
  };
}
