import type { SlashCommandItem } from "./slashCommands";

export const BUILTIN_SLASH_COMMANDS: SlashCommandItem[] = [
  {
    name: "install",
    command: "/install",
    description: "Install or enable a skill, MCP toolpack, capability, URL, repo, or local path.",
    capabilityId: "skill:niuma-agent:install",
    sourceType: "builtin_command",
  },
];

/**
 * 牛马Agent's own skills, described in the reader's language while they carry the built-in description
 * (the English text in chat.json). A skill imported under one of these ids shows its own
 * description, unless that is word for word the built-in one.
 */
export const BUILTIN_SLASH_DESCRIPTION_KEYS = new Map([
  ["skill:niuma-agent:install", "slashDescriptions.install"],
  ["skill:niuma-agent:self-evolution", "slashDescriptions.selfEvolution"],
]);
