export type DeliveryTone = "now" | "done" | "moving" | "later" | "waiting";

export function getDeliveryTone(status: string, selected: boolean): DeliveryTone {
  if (selected) return "now";
  if (status === "delivered") return "done";
  if (status === "out_for_delivery") return "moving";
  if (status === "rescheduled") return "later";
  return "waiting";
}

export function getDeliveryStateLabel(tone: DeliveryTone): string {
  return { now: "Selected", done: "Done", moving: "On road", later: "Later", waiting: "Waiting" }[tone];
}
