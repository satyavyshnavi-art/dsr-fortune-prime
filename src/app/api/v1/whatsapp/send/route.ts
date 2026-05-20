import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { whatsappMessages, whatsappTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendTemplate, sendText } from "@/lib/whatsapp";
import { z } from "zod";

const sendTemplateSchema = z.object({
  to: z.string().min(10, "Phone number is required"),
  templateId: z.string().uuid().optional(),
  templateName: z.string().optional(),
  languageCode: z.string().default("en"),
  components: z.array(z.record(z.string(), z.unknown())).optional(),
});

const sendTextSchema = z.object({
  to: z.string().min(10, "Phone number is required"),
  body: z.string().min(1, "Message body is required"),
});

/**
 * POST /api/v1/whatsapp/send
 * Send a template or text message via WhatsApp Cloud API.
 *
 * For template messages:
 *   { to, templateId | templateName, languageCode?, components? }
 *
 * For text messages:
 *   { to, body }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";

    // Determine if this is a text or template message
    if (body.body && !body.templateId && !body.templateName) {
      // Plain text message
      const parsed = sendTextSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
          { status: 400 }
        );
      }

      const result = await sendText(parsed.data);

      // Store outbound message
      await db.insert(whatsappMessages).values({
        direction: "outbound",
        waMessageId: result.messageId ?? null,
        fromNumber: phoneNumberId,
        toNumber: parsed.data.to,
        body: parsed.data.body,
        status: result.success ? "sent" : "failed",
        errorMessage: result.error ?? null,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: { code: "SEND_FAILED", message: result.error } },
          { status: 502 }
        );
      }

      return NextResponse.json({
        data: { messageId: result.messageId, to: parsed.data.to, type: "text" },
      });
    }

    // Template message
    const parsed = sendTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    // Resolve template name from DB if templateId is provided
    let templateName = parsed.data.templateName ?? "";
    let templateDbId: string | null = null;

    if (parsed.data.templateId) {
      const templates = await db
        .select()
        .from(whatsappTemplates)
        .where(eq(whatsappTemplates.id, parsed.data.templateId))
        .limit(1);

      if (templates.length === 0) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: "Template not found" } },
          { status: 404 }
        );
      }

      templateName = templates[0].name;
      templateDbId = templates[0].id;
    }

    if (!templateName) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "templateName or templateId is required" } },
        { status: 400 }
      );
    }

    const result = await sendTemplate({
      to: parsed.data.to,
      templateName,
      languageCode: parsed.data.languageCode,
      components: parsed.data.components,
    });

    // Store outbound template message
    await db.insert(whatsappMessages).values({
      direction: "outbound",
      waMessageId: result.messageId ?? null,
      fromNumber: phoneNumberId,
      toNumber: parsed.data.to,
      body: `[template: ${templateName}]`,
      templateId: templateDbId,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error ?? null,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "SEND_FAILED", message: result.error } },
        { status: 502 }
      );
    }

    return NextResponse.json({
      data: {
        messageId: result.messageId,
        to: parsed.data.to,
        type: "template",
        templateName,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/whatsapp/send error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to send message" } },
      { status: 500 }
    );
  }
}
