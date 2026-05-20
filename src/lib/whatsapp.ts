import crypto from "crypto";

// ==================== CONFIG ====================

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN ?? "";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "spotworks_verify_token";
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET ?? "";
const WHATSAPP_API_VERSION = "v21.0";
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}`;

// ==================== TYPES ====================

export interface InboundMessage {
  messageId: string;
  from: string;
  timestamp: string;
  type: "text" | "image" | "document" | "location" | "unknown";
  body: string;
}

export interface ParsedCommand {
  command: "LOG" | "CHECKIN" | "STATUS" | "HELP" | "UNKNOWN";
  payload: Record<string, unknown>;
  raw: string;
}

export interface SendTemplateParams {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Record<string, unknown>[];
}

export interface SendTextParams {
  to: string;
  body: string;
}

// ==================== SIGNATURE VERIFICATION ====================

/**
 * Verify the X-Hub-Signature-256 header from Meta webhook payloads.
 * Returns true if the signature is valid or if no app secret is configured (dev mode).
 */
export function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!WHATSAPP_APP_SECRET) {
    // No secret configured — skip verification in dev
    return true;
  }
  if (!signatureHeader) return false;

  const expectedSig = crypto
    .createHmac("sha256", WHATSAPP_APP_SECRET)
    .update(rawBody)
    .digest("hex");

  const receivedSig = signatureHeader.replace("sha256=", "");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSig, "hex"),
    Buffer.from(receivedSig, "hex")
  );
}

/**
 * Verify the Meta webhook verification challenge (GET request).
 */
export function verifyWebhookChallenge(
  mode: string | null,
  token: string | null,
  challenge: string | null
): { valid: boolean; challenge: string | null } {
  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    return { valid: true, challenge };
  }
  return { valid: false, challenge: null };
}

// ==================== INBOUND PARSING ====================

/**
 * Extract messages from a Meta Cloud API webhook payload.
 */
export function extractMessages(payload: Record<string, unknown>): InboundMessage[] {
  const messages: InboundMessage[] = [];

  try {
    const entry = payload.entry as Array<Record<string, unknown>> | undefined;
    if (!entry) return messages;

    for (const e of entry) {
      const changes = e.changes as Array<Record<string, unknown>> | undefined;
      if (!changes) continue;

      for (const change of changes) {
        const value = change.value as Record<string, unknown> | undefined;
        if (!value) continue;

        const msgs = value.messages as Array<Record<string, unknown>> | undefined;
        if (!msgs) continue;

        for (const msg of msgs) {
          const type = msg.type as string;
          let body = "";

          if (type === "text") {
            body = (msg.text as Record<string, string>)?.body ?? "";
          } else if (type === "image" || type === "document") {
            body = (msg[type] as Record<string, string>)?.caption ?? "";
          }

          messages.push({
            messageId: msg.id as string,
            from: msg.from as string,
            timestamp: msg.timestamp as string,
            type: (["text", "image", "document", "location"].includes(type)
              ? type
              : "unknown") as InboundMessage["type"],
            body,
          });
        }
      }
    }
  } catch {
    // Malformed payload — return empty
  }

  return messages;
}

/**
 * Parse a text message body into a structured command.
 *
 * Supported commands:
 *   LOG EB 450 units       → work log entry (meter type, reading, unit)
 *   LOG DG 120 units       → work log entry
 *   CHECKIN                 → attendance check-in
 *   CHECKOUT                → attendance check-out
 *   STATUS <task_id>        → query task status
 *   HELP                    → show available commands
 */
export function parseCommand(body: string): ParsedCommand {
  const raw = body.trim();
  const upper = raw.toUpperCase();
  const parts = raw.split(/\s+/);
  const keyword = parts[0]?.toUpperCase();

  if (keyword === "LOG" && parts.length >= 3) {
    const meterType = parts[1]?.toUpperCase();
    const reading = parseFloat(parts[2]);
    const unit = parts[3] ?? "units";

    return {
      command: "LOG",
      payload: {
        meterType: meterType === "EB" || meterType === "DG" ? meterType : meterType,
        reading: isNaN(reading) ? null : reading,
        unit,
      },
      raw,
    };
  }

  if (keyword === "CHECKIN" || upper === "CHECK IN") {
    return { command: "CHECKIN", payload: {}, raw };
  }

  if (keyword === "CHECKOUT" || upper === "CHECK OUT") {
    return { command: "CHECKIN", payload: { action: "checkout" }, raw };
  }

  if (keyword === "STATUS" && parts.length >= 2) {
    const taskId = parts.slice(1).join(" ");
    return { command: "STATUS", payload: { taskId }, raw };
  }

  if (keyword === "HELP") {
    return { command: "HELP", payload: {}, raw };
  }

  return { command: "UNKNOWN", payload: {}, raw };
}

// ==================== OUTBOUND: SEND TEXT ====================

/**
 * Send a plain text message via the WhatsApp Cloud API.
 */
export async function sendText(params: SendTextParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  try {
    const res = await fetch(`${WHATSAPP_API_BASE}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "text",
        text: { body: params.body },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: (errData as Record<string, unknown>).error?.toString() ?? `HTTP ${res.status}` };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const messages = data.messages as Array<Record<string, string>> | undefined;
    return { success: true, messageId: messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ==================== OUTBOUND: SEND TEMPLATE ====================

/**
 * Send a template message via the WhatsApp Cloud API.
 */
export async function sendTemplate(params: SendTemplateParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return { success: false, error: "WhatsApp credentials not configured" };
  }

  try {
    const res = await fetch(`${WHATSAPP_API_BASE}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "template",
        template: {
          name: params.templateName,
          language: { code: params.languageCode ?? "en" },
          components: params.components ?? [],
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: (errData as Record<string, unknown>).error?.toString() ?? `HTTP ${res.status}` };
    }

    const data = (await res.json()) as Record<string, unknown>;
    const messages = data.messages as Array<Record<string, string>> | undefined;
    return { success: true, messageId: messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ==================== RESPONSE BUILDERS ====================

const HELP_TEXT = `*SpotWorks WhatsApp Commands*

LOG EB 450 units — Record EB meter reading
LOG DG 120 units — Record DG meter reading
CHECKIN — Mark attendance check-in
CHECKOUT — Mark attendance check-out
STATUS <task_id> — Get task status

Reply with any command to get started.`;

/**
 * Build a response message for a parsed command.
 * This is used by the webhook handler to reply to inbound messages.
 */
export function buildReply(parsed: ParsedCommand): string {
  switch (parsed.command) {
    case "LOG": {
      const { meterType, reading, unit } = parsed.payload as { meterType: string; reading: number | null; unit: string };
      if (reading === null) {
        return "Invalid reading. Usage: LOG EB 450 units";
      }
      return `Logged ${meterType} reading: ${reading} ${unit}. Entry recorded.`;
    }
    case "CHECKIN": {
      const action = (parsed.payload as Record<string, string>).action;
      if (action === "checkout") {
        return "Check-out recorded. Have a good rest!";
      }
      return "Check-in recorded. Have a productive shift!";
    }
    case "STATUS": {
      const { taskId } = parsed.payload as { taskId: string };
      return `Looking up task: ${taskId}. You will receive an update shortly.`;
    }
    case "HELP":
      return HELP_TEXT;
    default:
      return `Unknown command. Reply HELP to see available commands.`;
  }
}
