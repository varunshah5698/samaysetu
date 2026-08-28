import { describe, expect, it } from "vitest";
import { customerOtpDestination } from "../client/src/lib/welcomeNavigation";

describe("customer dummy OTP entry", () => {
  it("opens the detailed customer home after successful demo entry", () => expect(customerOtpDestination).toBe("/details"));
});
