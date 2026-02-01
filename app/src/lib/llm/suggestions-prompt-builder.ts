import type { PainPoint } from "@/types/TPainPoint";
import type { SessionHistorySlot } from "@/types/TSessionHistory";
import { SUGGESTIONS_USER_MESSAGE_TEMPLATE } from "./suggestions-prompt";

function formatPainPoints(painPoints: PainPoint[]): string {
  if (painPoints.length === 0) {
    return "    <empty>No pain points marked yet</empty>";
  }

  return painPoints
    .map(
      (p) => `    <pain_point>
      <label>${p.label}</label>
      <type>${p.type}</type>
      <rating>${p.rating}/10</rating>
      ${p.notes ? `<notes>${p.notes}</notes>` : ""}
    </pain_point>`
    )
    .join("\n");
}

function formatConversationHistory(historySlots: SessionHistorySlot[]): string {
  if (historySlots.length === 0) {
    return "    <empty>No conversation yet</empty>";
  }

  return historySlots
    .map(
      (slot) => `    <exchange index="${slot.index}">
      ${slot.userMessage ? `<user_message>${slot.userMessage}</user_message>` : ""}
      ${slot.notes ? `<ai_notes>${slot.notes}</ai_notes>` : ""}
    </exchange>`
    )
    .join("\n");
}

function formatCurrentNotes(historySlots: SessionHistorySlot[]): string {
  if (historySlots.length === 0) {
    return "    <empty>No notes yet</empty>";
  }

  const latestNotes = historySlots[historySlots.length - 1]?.notes;
  return latestNotes ? `    ${latestNotes}` : "    <empty>No notes yet</empty>";
}

export function buildSuggestionsPrompt(
  painPoints: PainPoint[],
  historySlots: SessionHistorySlot[]
): string {
  const painPointsXml = formatPainPoints(painPoints);
  const conversationHistoryXml = formatConversationHistory(historySlots);
  const currentNotesXml = formatCurrentNotes(historySlots);

  return SUGGESTIONS_USER_MESSAGE_TEMPLATE.replace("{{PAIN_POINTS}}", painPointsXml)
    .replace("{{CONVERSATION_HISTORY}}", conversationHistoryXml)
    .replace("{{CURRENT_NOTES}}", currentNotesXml);
}
