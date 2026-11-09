// Installed by `niuma-agent sessions enable --runtime opencode`.
// The server supplies current per-call session metadata; the original TUI owns receiving.
const executable = __NIUMA_EXECUTABLE__;
const home = __NIUMA_HOME__;

export default {
  id: "niuma-agent.native",
  async setup(ctx) {
    if (["NIUMA_ACTOR_ID", "NIUMA_SECRETARY_TASK_TOKEN", "NIUMA_SECRETARY_TASK_TOKEN_FILE"].some(k => process.env[k]) || process.env.NIUMA_MCP_TOOL_PROFILE === "secretary-task") return;
    await ctx.mcp.transform(editor => {
      const previous = editor.get("niuma-agent");
      if (previous) {
        const command = previous.command;
        const args = Array.isArray(command) ? command.slice(1) : [];
        const native = args.length === 3 && args[0] === "mcp" && args[1] === "--local-session-runtime" && args[2] === "opencode";
        const ordinary = args.length === 1 && args[0] === "mcp";
        const scoped = ["NIUMA_ACTOR_ID", "NIUMA_SECRETARY_TASK_TOKEN", "NIUMA_SECRETARY_TASK_TOKEN_FILE"].some(k => previous.environment?.[k]) || previous.environment?.NIUMA_MCP_TOOL_PROFILE === "secretary-task";
        if (previous.type !== "local" || command?.[0] !== executable ||
            !(native || ordinary) || previous.environment?.NIUMA_HOME !== home || previous.disabled || scoped) {
          throw new Error("牛马Agent native access could not load: the existing niuma-agent MCP entry belongs to another configuration or is disabled. Resolve it in OpenCode before reloading.");
        }
      }
      editor.set("niuma-agent", {
        ...previous,
        type: "local",
        command: [executable, "mcp", "--local-session-runtime", "opencode"],
        environment: { ...previous?.environment, NIUMA_HOME: home },
        codemode: false,
      });
    });
  },
};
