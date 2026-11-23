import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent";
import {
    type Component,
    type Keybinding,
    type KeybindingsManager,
    matchesKey,
    type TUI,
    truncateToWidth,
    wrapTextWithAnsi,
} from "@mariozechner/pi-tui";

/**
 * Permission gate for file-modifying actions.
 *
 * The confirmation is an inline custom component (not a full-screen dialog):
 * it takes at most PROMPT_HEIGHT_RATIO of the terminal and leaves the rest of
 * the transcript visible above it. Long commands/details scroll inside the
 * panel with PgUp/PgDn (or Ctrl+U/Ctrl+D).
 */

/** Fraction of the terminal height the prompt may use. */
const PROMPT_HEIGHT_RATIO = 0.5;

const fileBashPatterns = [/\bmv\s+/i, /\brm\s+/i];

interface PermissionRequest {
    title: string;
    body: string;
}

interface PermissionPromptOptions {
    request: PermissionRequest;
    tui: TUI;
    theme: Theme;
    keybindings: KeybindingsManager;
    done: (allowed: boolean) => void;
}

class PermissionPrompt implements Component {
    /** Claim PgUp/PgDn while the prompt is open so they scroll its contents. */
    readonly capturesViewportInput = true;

    private readonly request: PermissionRequest;
    private readonly tui: TUI;
    private readonly theme: Theme;
    private readonly keybindings: KeybindingsManager;
    private readonly done: (allowed: boolean) => void;

    private selectedIndex = 0; // default to "No" (safer)
    private scrollTop = 0;
    private bodyRows = 1;
    private bodyLength = 0;
    private finished = false;
    private bodyCache?: { width: number; lines: string[] };

    constructor(options: PermissionPromptOptions) {
        this.request = options.request;
        this.tui = options.tui;
        this.theme = options.theme;
        this.keybindings = options.keybindings;
        this.done = options.done;
    }

    invalidate(): void {
        this.bodyCache = undefined;
    }

    render(width: number): string[] {
        const w = Math.max(1, Math.floor(width));
        if (w < 4) {
            return [truncateToWidth(this.request.title, w, "", true)];
        }

        const innerWidth = w - 2;
        const termRows = Math.max(1, this.tui.terminal.rows);
        // Same rounding as the overlay/layout code: 50% of the terminal height.
        const maxHeight = Math.max(
            9,
            Math.floor(termRows * PROMPT_HEIGHT_RATIO),
        );

        const body = this.bodyLines(innerWidth);
        // top border + title + blank + blank + 2 options + hints + bottom border
        const fixedRows = 8;
        let bodyRows = Math.max(1, maxHeight - fixedRows);
        const scrollable = body.length > bodyRows;
        if (scrollable) bodyRows = Math.max(1, bodyRows - 1);

        this.bodyRows = bodyRows;
        this.bodyLength = body.length;
        this.scrollTop = clamp(
            this.scrollTop,
            0,
            Math.max(0, body.length - bodyRows),
        );

        const visibleBody = body.slice(
            this.scrollTop,
            this.scrollTop + bodyRows,
        );
        const lines: string[] = [];

        lines.push(this.border(innerWidth, true));
        lines.push(
            this.row(
                this.theme.fg("accent", this.theme.bold(this.request.title)),
                innerWidth,
            ),
        );
        lines.push(this.row("", innerWidth));
        for (const line of visibleBody) {
            lines.push(this.row(line, innerWidth));
        }
        if (scrollable) {
            const first = this.scrollTop + 1;
            const last = Math.min(body.length, this.scrollTop + bodyRows);
            const pageKeys = `${this.keys("tui.select.pageUp")}/${this.keys("tui.select.pageDown")}`;
            lines.push(
                this.row(
                    this.theme.fg(
                        "dim",
                        `  ${first}-${last} of ${body.length} · ${pageKeys} scroll`,
                    ),
                    innerWidth,
                ),
            );
        }
        lines.push(this.row("", innerWidth));
        lines.push(this.row(this.optionLine("Yes"), innerWidth));
        lines.push(this.row(this.optionLine("No"), innerWidth));
        lines.push(this.row(this.theme.fg("dim", this.hintLine()), innerWidth));
        lines.push(this.border(innerWidth, false));

        return lines;
    }

    handleInput(data: string): void {
        const kb = this.keybindings;

        if (data === "y" || data === "Y") {
            this.finish(true);
            return;
        }
        if (data === "n" || data === "N") {
            this.finish(false);
            return;
        }

        if (kb.matches(data, "tui.select.up")) {
            this.selectedIndex = 0;
            this.tui.requestRender();
            return;
        }
        if (kb.matches(data, "tui.select.down")) {
            this.selectedIndex = 1;
            this.tui.requestRender();
            return;
        }
        if (
            kb.matches(data, "tui.select.confirm") ||
            data === "\n" ||
            data === "\r"
        ) {
            this.finish(this.selectedIndex === 0);
            return;
        }
        if (kb.matches(data, "tui.select.cancel")) {
            this.finish(false);
            return;
        }

        const page = Math.max(1, this.bodyRows - 1);
        if (
            kb.matches(data, "tui.select.pageUp") ||
            matchesKey(data, "ctrl+u")
        ) {
            this.scrollBy(-page);
            return;
        }
        if (
            kb.matches(data, "tui.select.pageDown") ||
            matchesKey(data, "ctrl+d")
        ) {
            this.scrollBy(page);
            return;
        }
        if (matchesKey(data, "home")) {
            this.scrollTo(0);
            return;
        }
        if (matchesKey(data, "end")) {
            this.scrollTo(this.bodyLength);
        }
    }

    private bodyLines(width: number): string[] {
        if (this.bodyCache?.width === width) {
            return this.bodyCache.lines;
        }
        const lines = wrapTextWithAnsi(
            this.request.body,
            Math.max(1, width - 4),
        ).map((line) => `  ${line}`);
        this.bodyCache = { width, lines };
        return lines;
    }

    private border(innerWidth: number, top: boolean): string {
        const bar = "─".repeat(Math.max(0, innerWidth));
        return this.theme.fg("border", top ? `╭${bar}╮` : `╰${bar}╯`);
    }

    private row(content: string, innerWidth: number): string {
        return (
            this.theme.fg("border", "│") +
            truncateToWidth(content, innerWidth, "", true) +
            this.theme.fg("border", "│")
        );
    }

    private optionLine(label: string): string {
        const index = label === "Yes" ? 0 : 1;
        return index === this.selectedIndex
            ? this.theme.fg("accent", `  → ${label}`)
            : this.theme.fg("text", `    ${label}`);
    }

    private hintLine(): string {
        const up = this.keys("tui.select.up");
        const down = this.keys("tui.select.down");
        const confirm = this.keys("tui.select.confirm");
        const cancel = this.keys("tui.select.cancel");
        return `  ${up}/${down} choose · ${confirm} confirm · ${cancel} deny · y/n`;
    }

    private keys(binding: Keybinding): string {
        const keys = this.keybindings.getKeys(binding);
        return keys.length > 0 ? keys.join("/") : "-";
    }

    private scrollBy(delta: number): void {
        this.scrollTo(this.scrollTop + delta);
    }

    private scrollTo(top: number): void {
        const next = clamp(
            top,
            0,
            Math.max(0, this.bodyLength - this.bodyRows),
        );
        if (next === this.scrollTop) return;
        this.scrollTop = next;
        this.tui.requestRender();
    }

    private finish(allowed: boolean): void {
        if (this.finished) return;
        this.finished = true;
        this.done(allowed);
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.trunc(value)));
}

function describeRequest(event: {
    toolName: string;
    input: Record<string, unknown>;
}): PermissionRequest | undefined {
    if (event.toolName === "write" || event.toolName === "edit") {
        const target =
            typeof event.input.path === "string" ? event.input.path : "a file";
        return {
            title: `Permission required · ${event.toolName}`,
            body: `The agent wants to ${event.toolName} this file:\n\n  ${target}\n\nThis changes the file on disk.`,
        };
    }

    if (event.toolName === "bash") {
        const command =
            typeof event.input.command === "string" ? event.input.command : "";
        if (fileBashPatterns.some((pattern) => pattern.test(command))) {
            return {
                title: "Permission required · bash",
                body: `The agent wants to run this file command:\n\n  ${command}\n\nIt can move or delete files.`,
            };
        }
    }

    return undefined;
}

export default function (pi: ExtensionAPI) {
    pi.on("tool_call", async (event, ctx) => {
        const request = describeRequest(
            event as { toolName: string; input: Record<string, unknown> },
        );
        if (!request) return undefined;

        if (!ctx.hasUI) {
            return {
                block: true,
                reason: "Action blocked (no UI available for confirmation)",
            };
        }

        const askWithSelector = async () => {
            // RPC (and anything without custom-component support) uses the plain selector.
            const choice = await ctx.ui.select(
                `${request.title}\n\n${request.body}\n\nAllow?`,
                ["Yes", "No"],
            );
            return choice === "Yes";
        };

        let allowed: boolean;
        if (ctx.mode === "tui") {
            try {
                allowed = await ctx.ui.custom<boolean>(
                    (tui, theme, keybindings, done) =>
                        new PermissionPrompt({
                            request,
                            tui,
                            theme,
                            keybindings,
                            done,
                        }),
                    {
                        blocked: { kind: "permission", message: request.title },
                    },
                );
            } catch {
                allowed = await askWithSelector();
            }
        } else {
            allowed = await askWithSelector();
        }

        if (!allowed) {
            return { block: true, reason: "File modification blocked by user" };
        }

        return undefined;
    });
}
