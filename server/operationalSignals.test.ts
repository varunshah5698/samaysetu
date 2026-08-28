import { describe, expect, it } from "vitest";
import { getOperationalSnapshot } from "./operationalSignals";

describe("operational delivery signals", () => {
  it("returns Delhi weather and notification workflow fields", async () => { const result = await getOperationalSnapshot(28.6139, 77.2090); expect(result.weather.source).toContain("Open-Meteo"); expect(result.notifications.eventHooks).toContain("booking_confirmed"); expect(result.checkedAt).toBeGreaterThan(0); }, 20_000);
});
