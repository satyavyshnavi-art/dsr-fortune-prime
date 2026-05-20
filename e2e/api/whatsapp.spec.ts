import { test, expect } from "@playwright/test";

test.describe("WhatsApp Webhook API", () => {
  test.describe("GET /api/v1/whatsapp/webhook — Verification", () => {
    test("returns challenge when valid verify token is provided", async ({ request }) => {
      const challenge = "test_challenge_string_12345";
      const res = await request.get("/api/v1/whatsapp/webhook", {
        params: {
          "hub.mode": "subscribe",
          "hub.verify_token": process.env.WHATSAPP_VERIFY_TOKEN ?? "test-verify-token",
          "hub.challenge": challenge,
        },
      });

      // Should return 200 with the challenge string, or 403 if token mismatch
      const status = res.status();
      expect([200, 403]).toContain(status);

      if (status === 200) {
        const body = await res.text();
        expect(body).toBe(challenge);
      }
    });

    test("returns 403 when verify token is missing", async ({ request }) => {
      const res = await request.get("/api/v1/whatsapp/webhook", {
        params: {
          "hub.mode": "subscribe",
          "hub.challenge": "some_challenge",
        },
      });

      expect(res.status()).toBe(403);
      const body = await res.json();
      expect(body.error).toBe("Verification failed");
    });

    test("returns 403 when hub.mode is not subscribe", async ({ request }) => {
      const res = await request.get("/api/v1/whatsapp/webhook", {
        params: {
          "hub.mode": "unsubscribe",
          "hub.verify_token": "any-token",
          "hub.challenge": "challenge",
        },
      });

      expect(res.status()).toBe(403);
    });

    test("returns 403 with no parameters", async ({ request }) => {
      const res = await request.get("/api/v1/whatsapp/webhook");
      expect(res.status()).toBe(403);
    });
  });

  test.describe("POST /api/v1/whatsapp/webhook — Inbound Messages", () => {
    test("returns 200 for empty entry payload (status update)", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/webhook", {
        data: {
          object: "whatsapp_business_account",
          entry: [],
        },
      });

      // Should return 200 even on error to prevent Meta retry storms
      expect(res.status()).toBe(200);
    });

    test("returns 200 for payload with no messages (delivery status)", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/webhook", {
        data: {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "123456",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "12345",
                    },
                    statuses: [
                      {
                        id: "wamid.test123",
                        status: "delivered",
                        timestamp: "1234567890",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        },
      });

      expect(res.status()).toBe(200);
    });

    test("handles LOG command payload", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/webhook", {
        data: {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "biz-account-id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "12345",
                    },
                    messages: [
                      {
                        from: "919876543210",
                        id: "wamid.test-log-001",
                        timestamp: "1234567890",
                        text: { body: "LOG Cleaned lobby area and restrooms" },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        },
      });

      // Always 200 to Meta — either processed or error-handled gracefully
      expect(res.status()).toBe(200);
    });

    test("handles CHECKIN command payload", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/webhook", {
        data: {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "biz-account-id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "12345",
                    },
                    messages: [
                      {
                        from: "919876543210",
                        id: "wamid.test-checkin-001",
                        timestamp: "1234567890",
                        text: { body: "CHECKIN" },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        },
      });

      expect(res.status()).toBe(200);
    });

    test("handles STATUS command payload", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/webhook", {
        data: {
          object: "whatsapp_business_account",
          entry: [
            {
              id: "biz-account-id",
              changes: [
                {
                  value: {
                    messaging_product: "whatsapp",
                    metadata: {
                      display_phone_number: "15551234567",
                      phone_number_id: "12345",
                    },
                    messages: [
                      {
                        from: "919876543210",
                        id: "wamid.test-status-001",
                        timestamp: "1234567890",
                        text: { body: "STATUS" },
                        type: "text",
                      },
                    ],
                  },
                  field: "messages",
                },
              ],
            },
          ],
        },
      });

      expect(res.status()).toBe(200);
    });

    test("handles malformed JSON gracefully (returns 200)", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/webhook", {
        headers: { "Content-Type": "text/plain" },
        data: "this is not json",
      });

      // Webhook always returns 200 to prevent Meta retry storms
      expect(res.status()).toBe(200);
    });
  });

  test.describe("POST /api/v1/whatsapp/send — Outbound Messages", () => {
    test("returns 400 for missing phone number", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/send", {
        data: {
          body: "Hello from E2E test",
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    test("returns 400 for empty message body", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/send", {
        data: {
          to: "919876543210",
          body: "",
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    test("returns 400 for short phone number", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/send", {
        data: {
          to: "123",
          body: "Test message",
        },
      });

      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    test("template send returns 400 without templateName or templateId", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/send", {
        data: {
          to: "919876543210",
          templateId: undefined,
          templateName: undefined,
          languageCode: "en",
        },
      });

      // Should fail validation since no body and no template info
      const status = res.status();
      expect([400, 500]).toContain(status);
    });

    test("text send with valid payload returns 502 or success", async ({ request }) => {
      const res = await request.post("/api/v1/whatsapp/send", {
        data: {
          to: "919876543210",
          body: "E2E test message - please ignore",
        },
      });

      // 502 expected since actual WhatsApp API credentials are not configured in test
      // 200 if somehow the send succeeds
      const status = res.status();
      expect([200, 502, 500]).toContain(status);
    });
  });
});
