import { appRouter } from "../server/routers.ts";

const caller = appRouter.createCaller({ user: null, req: {}, res: {} });
const booked = await caller.delivery.book({ area: "Postman nearby check · Laxmi Nagar", latitude: 28.631, longitude: 77.278, day: "Wednesday", time: "10:30", festival: false, selectedSlot: "Morning" });
const nearby = await caller.delivery.demoMarkNearby({ id: booked.delivery.id });
const tracked = await caller.delivery.track({ trackingCode: booked.delivery.trackingCode });
if (!nearby.notification || !tracked?.events.some(event => event.eventType === "postman_nearby")) throw new Error("Nearby update did not create the tracking event and notification intent");
console.log(JSON.stringify({ trackingCode: booked.delivery.trackingCode, notificationState: nearby.notification.providerState, nearbyMessage: nearby.notification.message, events: tracked.events.map(event => event.eventType) }, null, 2));
process.exit(0);
