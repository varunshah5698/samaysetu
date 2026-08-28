import { describe, expect, it } from "vitest";
import { getDeliveryStateLabel, getDeliveryTone } from "../client/src/lib/routePresentation";

describe("postman route presentation", () => {
  it("gives the selected delivery the clearest priority colour", () => {
    expect(getDeliveryTone("booked", true)).toBe("now");
    expect(getDeliveryTone("delivered", false)).toBe("done");
    expect(getDeliveryStateLabel("moving")).toBe("On road");
  });
});
