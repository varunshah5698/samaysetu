import { describe, expect, it } from "vitest";
import { createQuickBookingPayload } from "../client/src/lib/quickBooking";

describe("simple booking submission", () => {
  it("keeps the selected two-hour slot in the real booking payload", () => {
    expect(createQuickBookingPayload({ area: "  Laxmi Nagar  ", day: "Wednesday", time: "10:30", selectedSlot: "Midday", latitude: 28.631, longitude: 77.278 })).toMatchObject({ area: "Laxmi Nagar", selectedSlot: "Midday", festival: false, latitude: 28.631, longitude: 77.278 });
  });
});
