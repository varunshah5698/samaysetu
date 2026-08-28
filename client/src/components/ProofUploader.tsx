import { FileUp, Loader2, LockKeyhole } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const maximumBytes = 5 * 1024 * 1024;

export function ProofUploader({ deliveryId }: { deliveryId: string }) {
  const { isAuthenticated, loading } = useAuth(); const ref = useRef<HTMLInputElement>(null); const [busy, setBusy] = useState(false);
  const upload = trpc.delivery.uploadProof.useMutation({ onSuccess: () => toast.success("Proof saved securely"), onError: error => toast.error(error.message || "Could not save proof") });
  const choose = () => { if (!isAuthenticated) { startLogin(); return; } ref.current?.click(); };
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > maximumBytes) { toast.error("Choose a file smaller than 5 MB"); return; } if (!file.type.startsWith("image/") && file.type !== "application/pdf") { toast.error("Use an image or PDF proof file"); return; } setBusy(true); try { const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read file")); reader.readAsDataURL(file); }); await upload.mutateAsync({ deliveryId, fileName: file.name, mimeType: file.type, dataUrl }); } catch (error) { toast.error(error instanceof Error ? error.message : "Upload failed"); } finally { setBusy(false); event.target.value = ""; } };
  return <div className="proof-upload"><input ref={ref} className="sr-only" type="file" accept="image/*,application/pdf" onChange={onChange} /><button type="button" className="proof-button" onClick={choose} disabled={busy || loading}>{busy ? <Loader2 size={14} className="spin" /> : isAuthenticated ? <FileUp size={14} /> : <LockKeyhole size={14} />}{busy ? "Saving proof…" : isAuthenticated ? "Attach proof" : "Sign in to attach proof"}</button><small>Secure storage · JPG, PNG, PDF · 5 MB max</small></div>;
}
