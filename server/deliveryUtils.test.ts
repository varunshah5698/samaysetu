import { describe, expect, it } from "vitest";
import { cleanFileName, decodeProofDataUrl } from "./deliveryUtils";

describe("delivery proof validation", () => {
  it("normalises unsafe file names", () => expect(cleanFileName("proof of delivery?.png")).toBe("proof_of_delivery_.png"));
  it("decodes an allowed image payload", () => expect(decodeProofDataUrl("data:image/png;base64,aGk=", "image/png").toString()).toBe("hi"));
  it("rejects unsupported proof types", () => expect(() => decodeProofDataUrl("data:text/plain;base64,aGk=", "text/plain")).toThrow("Unsupported proof file type"));
});
