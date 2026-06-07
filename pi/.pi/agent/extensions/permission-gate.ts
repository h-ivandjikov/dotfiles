import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // Patterns to catch renaming/moving (mv) and deleting (rm)
  const fileBashPatterns = [/\bmv\s+/i, /\brm\s+/i];

  pi.on("tool_call", async (event, ctx) => {
    let needsPermission = false;
    let warningMessage = "";

    // 1. Catch Writing and Editing tools
    if (event.toolName === "write" || event.toolName === "edit") {
      const targetFile = event.input.path || "a file";
      warningMessage = `⚠️ The agent wants to ${event.toolName} '${targetFile}'.\n\nAllow?`;
      needsPermission = true;
    }
    // 2. Catch Renaming and Deleting via bash tool
    else if (event.toolName === "bash") {
      const command = (event.input.command as string) || "";
      if (fileBashPatterns.some((p) => p.test(command))) {
        warningMessage = `⚠️ The agent wants to execute a file command:\n\n  ${command}\n\nAllow?`;
        needsPermission = true;
      }
    }

    // 3. Trigger the prompt if a restricted action was caught
    if (needsPermission) {
      if (!ctx.hasUI) {
        return {
          block: true,
          reason: "Action blocked (no UI available for confirmation)",
        };
      }

      const choice = await ctx.ui.select(warningMessage, ["Yes", "No"]);

      if (choice !== "Yes") {
        return { block: true, reason: "File modification blocked by user" };
      }
    }

    // Allow safe actions (like reading files or running 'ls') to pass through
    return undefined;
  });
}
