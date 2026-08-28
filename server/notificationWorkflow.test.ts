import { describe, expect, it } from "vitest";
import { buildNotificationIntent } from "./notificationWorkflow";

describe("notification workflow", () => {
  it("creates a WhatsApp and SMS outbox intent without claiming delivery", () => { const intent = buildNotificationIntent("booking_confirmed"); expect(intent.channels).toEqual(["whatsapp", "sms"]); expect(["provider_required", "queued"]).toContain(intent.providerState); });
  it("creates a clear customer alert when the postman is close", () => { expect(buildNotificationIntent("postman_nearby").message).toContain("delivery person is close"); });
});
