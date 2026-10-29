import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";

import { afterEach, expect, it } from "vitest";

import { schoolClaudeEnvironment } from "./SchoolClaudeEnvironment.ts";

const root = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "school-claude-test-"));
const directory = NodePath.join(root, "SchoolClaudeClient");

afterEach(() => {
  NodeFS.rmSync(directory, { recursive: true, force: true });
});

function makeInstallation(
  token = "test-token-abcdefghijklmnopqrstuvwxyz012345",
  url = "https://proxy.example",
) {
  NodeFS.mkdirSync(NodePath.join(directory, "git", "bin"), { recursive: true });
  NodeFS.writeFileSync(NodePath.join(directory, "claude.exe"), "");
  NodeFS.writeFileSync(NodePath.join(directory, "git", "bin", "bash.exe"), "");
  NodeFS.writeFileSync(
    NodePath.join(directory, "School Claude.cmd"),
    `@echo off\r\nset "ANTHROPIC_AUTH_TOKEN=${token}"\r\nset "ANTHROPIC_BASE_URL=${url}"\r\n`,
  );
}

it("uses the installed Claude and proxy without running the launcher", () => {
  makeInstallation();
  const result = schoolClaudeEnvironment("win32", { LOCALAPPDATA: root, PATH: "original" });
  expect(result.ANTHROPIC_AUTH_TOKEN).toBe("test-token-abcdefghijklmnopqrstuvwxyz012345");
  expect(result.ANTHROPIC_BASE_URL).toBe("https://proxy.example");
  expect(result.ANTHROPIC_API_KEY).toBe("");
  expect(result.CLAUDE_CODE_GIT_BASH_PATH).toBe(NodePath.join(directory, "git", "bin", "bash.exe"));
  expect(result.PATH).toBe(`${directory};${NodePath.join(directory, "git", "cmd")};original`);
});

it("ignores missing, invalid, or non-Windows installations", () => {
  expect(schoolClaudeEnvironment("win32", { LOCALAPPDATA: root })).toEqual({});
  makeInstallation("bad token", "http://proxy.example");
  expect(schoolClaudeEnvironment("win32", { LOCALAPPDATA: root })).toEqual({});
  makeInstallation("test-token-abcdefghijklmnopqrstuvwxyz012345", "http://proxy.example");
  expect(schoolClaudeEnvironment("win32", { LOCALAPPDATA: root })).toEqual({});
  expect(schoolClaudeEnvironment("linux", { LOCALAPPDATA: root })).toEqual({});
});
