export const allowedProofMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
export const maxProofBytes = 5 * 1024 * 1024;

export function cleanFileName(name: string) { return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^_+/, "").slice(0, 120) || "delivery-proof"; }

export function decodeProofDataUrl(dataUrl: string, mimeType: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,([a-zA-Z0-9+/=]+)$/); if (!match || match[1] !== mimeType) throw new Error("Invalid proof file payload");
  if (!allowedProofMimeTypes.has(mimeType)) throw new Error("Unsupported proof file type");
  const bytes = Buffer.from(match[2], "base64"); if (bytes.length === 0 || bytes.length > maxProofBytes) throw new Error("Proof file must be between 1 byte and 5 MB");
  return bytes;
}
