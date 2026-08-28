import { desc, eq } from "drizzle-orm";
import { deliveryNotificationOutbox } from "../drizzle/schema.ts";
import { getDb, getDeliveryByCode } from "../server/db.ts";
import { appRouter } from "../server/routers.ts";

const trackingCode = process.argv[2];
if (!trackingCode) throw new Error("Pass a tracking code, for example: pnpm tsx scripts/verify-notification-outbox.mjs PP-XXXX");
const found = await getDeliveryByCode(trackingCode);
if (!found?.delivery) throw new Error(`Delivery ${trackingCode} was not found`);
const caller = appRouter.createCaller({ user: { id: 1, openId: "operational-verifier", role: "admin" }, req: {}, res: {} });
const result = await caller.delivery.updateStatus({ id: found.delivery.id, status: "out_for_delivery", note: "Operational verification: protected postman update queued." });
const delivery = result.delivery;
if (!delivery) throw new Error("The delivery status was not updated");
const db = await getDb();
const rows = db ? await db.select().from(deliveryNotificationOutbox).where(eq(deliveryNotificationOutbox.trackingCode, trackingCode)).orderBy(desc(deliveryNotificationOutbox.createdAt)).limit(2) : [];
console.log(JSON.stringify({ trackingCode, status: delivery.status, providerState: result.notification?.providerState, events: rows.map(row => ({ eventType: row.eventType, channels: row.channels, providerState: row.providerState })) }, null, 2));
process.exit(0);
