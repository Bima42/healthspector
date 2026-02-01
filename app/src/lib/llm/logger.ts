import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "llm-requests.md");

/**
 * Ensures the log directory exists
 */
async function ensureLogDirectory() {
  if (!existsSync(LOG_DIR)) {
    await mkdir(LOG_DIR, { recursive: true });
  }
}

/**
 * Formats a timestamp for logging
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Logs LLM request and response to markdown file
 */
export async function logLLMRequest(
  systemMessage: string,
  userPrompt: string,
  response: string | null,
  error: Error | null = null
): Promise<void> {
  try {
    await ensureLogDirectory();

    const timestamp = formatTimestamp();
    const status = error ? "❌ ERROR" : "✅ SUCCESS";

    const logEntry = `
---

## Request - ${timestamp} - ${status}

### System Message
\`\`\`
${systemMessage}
\`\`\`

### User Prompt
\`\`\`
${userPrompt}
\`\`\`

### Response
${
  error
    ? `\`\`\`
ERROR: ${error.message}

${error.stack || "No stack trace"}
\`\`\``
    : `\`\`\`json
${response}
\`\`\``
}

---

`;

    // Append to file (create if doesn't exist)
    const existingContent = existsSync(LOG_FILE)
      ? await import("fs/promises").then((fs) => fs.readFile(LOG_FILE, "utf-8"))
      : `# LLM Request Logs\n\nGenerated automatically by the application.\n\n`;

    await writeFile(LOG_FILE, existingContent + logEntry, "utf-8");
  } catch (logError) {
    // Don't throw - logging failures shouldn't break the app
    console.error("[Logger] Failed to write log:", logError);
  }
}