import type { PredefinedPainPoint } from "@/types/TPainPoint";
import type { SessionHistorySlot } from "@/types/TSessionHistory";
import { SESSION_USER_MESSAGE_TEMPLATE } from "./session-prompt";

/**
 * Builds the formatted list of available body zones
 */
function formatAvailableZones(predefinedPoints: PredefinedPainPoint[]): string {
  return predefinedPoints
    .map((p) => `  <zone name="${p.name}" label="${p.label}" category="${p.category}" />`)
    .join("\n");
}

/**
 * Formats a single history slot with its pain points
 */
function formatHistorySlot(slot: SessionHistorySlot): string {
  const painPointsXml =
    slot.painPoints.length > 0
      ? slot.painPoints
          .map(
            (p) => `      <pain_point>
        <label>${p.label}</label>
        <type>${p.type}</type>
        <rating>${p.rating}/10</rating>
        ${p.notes ? `<notes>${p.notes}</notes>` : ""}
      </pain_point>`
          )
          .join("\n")
      : "      <empty>None</empty>";

  return `  <slot index="${slot.index}" timestamp="${slot.createdAt.toISOString()}">
    <user_message>${slot.userMessage || "N/A"}</user_message>
    <notes>${slot.notes || "N/A"}</notes>
    <pain_points>
${painPointsXml}
    </pain_points>
  </slot>`;
}

/**
 * Builds the formatted session history
 */
function formatSessionHistory(historySlots: SessionHistorySlot[]): string {
  if (historySlots.length === 0) {
    return "  <empty>No history yet</empty>";
  }

  return historySlots.map(formatHistorySlot).join("\n\n");
}

/**
 * Builds the complete session prompt by replacing template variables
 */
export function buildSessionPrompt(
  predefinedPoints: PredefinedPainPoint[],
  historySlots: SessionHistorySlot[],
  userMessage: string
): string {
  const availableZones = formatAvailableZones(predefinedPoints);
  const sessionHistory = formatSessionHistory(historySlots);

  return SESSION_USER_MESSAGE_TEMPLATE
    .replace("{{AVAILABLE_ZONES}}", availableZones)
    .replace("{{SESSION_HISTORY}}", sessionHistory)
    .replace("{{USER_MESSAGE}}", userMessage);
}