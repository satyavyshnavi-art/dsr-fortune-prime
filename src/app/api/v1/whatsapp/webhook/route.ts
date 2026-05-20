import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whatsappMessages } from "@/db/schema";
import {
  verifySignature,
  verifyWebhookChallenge,
  extractMessages,
  parseCommand,
  buildReply,
  sendText,
} from "@/lib/whatsapp";

/**
 * GET /api/v1/whatsapp/webhook
 * Meta webhook verification challenge. Called once when registering the webhook URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const result = verifyWebhookChallenge(mode, token, challenge);

  if (result.valid) {
    // Meta expects the challenge string back as plain text, not JSON
    return new NextResponse(result.challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * POST /api/v1/whatsapp/webhook
 * Receives inbound messages from Meta Cloud API.
 * Parses keywords (LOG, CHECKIN, STATUS) and stores + replies.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Verify signature from Meta
    const signatureHeader = request.headers.get("x-hub-signature-256");
    if (!verifySignature(rawBody, signatureHeader)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const messages = extractMessages(payload);

    if (messages.length === 0) {
      // Status updates or other non-message events — acknowledge
      return NextResponse.json({ status: "ok" });
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";

    for (const msg of messages) {
      const parsed = parseCommand(msg.body);

      // Store inbound message
      await db.insert(whatsappMessages).values({
        direction: "inbound",
        waMessageId: msg.messageId,
        fromNumber: msg.from,
        toNumber: phoneNumberId,
        body: msg.body,
        parsedCommand: parsed.command,
        parsedPayload: parsed.payload,
      });

      // Build and send reply
      const replyText = buildReply(parsed);
      const sendResult = await sendText({ to: msg.from, body: replyText });

      // Store outbound reply
      await db.insert(whatsappMessages).values({
        direction: "outbound",
        waMessageId: sendResult.messageId ?? null,
        fromNumber: phoneNumberId,
        toNumber: msg.from,
        body: replyText,
        parsedCommand: parsed.command,
        status: sendResult.success ? "sent" : "failed",
        errorMessage: sendResult.error ?? null,
      });
    }

    return NextResponse.json({ status: "ok", processed: messages.length });
  } catch (error) {
    console.error("POST /api/v1/whatsapp/webhook error:", error);
    // Always return 200 to Meta to prevent retry storms
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
