import { appRouter } from "../server/routers.ts";

const caller = appRouter.createCaller({ user: null, req: {}, res: {} });
const result = await caller.delivery.book({ area: "Samaysetu booking check · Laxmi Nagar", latitude: 28.631, longitude: 77.278, day: "Wednesday", time: "10:30", festival: false, selectedSlot: "Morning" });
const tracked = await caller.delivery.track({ trackingCode: result.delivery.trackingCode });
if (!tracked?.delivery || tracked.delivery.selectedSlot !== "Morning") throw new Error("Quick booking confirmation did not preserve the selected slot");
console.log(JSON.stringify({ trackingCode: result.delivery.trackingCode, selectedSlot: tracked.delivery.selectedSlot, status: tracked.delivery.status, eventCount: tracked.events.length }, null, 2));
process.exit(0);
