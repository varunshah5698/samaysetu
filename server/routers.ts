import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createDelivery, getDeliveryByCode, getLiveSignals, listDeliveryProofs, listRouteDeliveries, recordPostmanNearby, saveDeliveryProof, updateDeliveryStatus } from "./db";
import { scoreDeliverySlots } from "./deliveryEngine";
import { cleanFileName, decodeProofDataUrl } from "./deliveryUtils";
import { getOperationalSnapshot } from "./operationalSignals";
import { queueNotification } from "./notificationWorkflow";
import { storagePut } from "./storage";

const bookingInput = z.object({ area: z.string().min(3).max(180), latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180), day: z.string().min(3).max(16), time: z.string().regex(/^\d{2}:\d{2}$/), festival: z.boolean(), selectedSlot: z.string().min(3).max(32) }); const statusUpdateInput = z.object({ id: z.number().int().positive(), status: z.enum(["assigned", "out_for_delivery", "delivered", "rescheduled"]), note: z.string().min(4).max(320) });

export const appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query(opts => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => { ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 }); return { success: true } as const; }) }),
  delivery: router({
    preview: publicProcedure.input(z.object({ day: z.string().min(3).max(16), time: z.string().regex(/^\d{2}:\d{2}$/), festival: z.boolean(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional() })).query(async ({ input }) => { const signals = await getLiveSignals(); const operations = await getOperationalSnapshot(input.latitude, input.longitude); const slots = scoreDeliverySlots({ ...input, signals, operational: operations }); return { signals, operations, slots, generatedAt: Date.now() }; }),
    book: publicProcedure.input(bookingInput).mutation(async ({ input }) => { const signals = await getLiveSignals(); const operations = await getOperationalSnapshot(input.latitude, input.longitude); const slots = scoreDeliverySlots({ day: input.day, time: input.time, festival: input.festival, signals, operational: operations }); const selected = slots.find(slot => slot.label === input.selectedSlot) ?? slots[0]; const trackingCode = `PP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`; const delivery = await createDelivery({ trackingCode, area: input.area, latitude: String(input.latitude), longitude: String(input.longitude), requestedDay: input.day, preferredTime: input.time, selectedSlot: selected.label, predictedScore: selected.score }); const notification = await queueNotification({ deliveryId: delivery.id, trackingCode: delivery.trackingCode, eventType: "booking_confirmed" }); return { delivery, signals, operations, slots, notification }; }),
    track: publicProcedure.input(z.object({ trackingCode: z.string().min(4).max(40) })).query(({ input }) => getDeliveryByCode(input.trackingCode)),
    route: publicProcedure.query(async () => ({ deliveries: await listRouteDeliveries(), signals: await getLiveSignals(), checkedAt: Date.now() })),
    updateStatus: protectedProcedure.input(statusUpdateInput).mutation(async ({ input }) => { const delivery = await updateDeliveryStatus(input.id, input.status, input.note); const notification = delivery ? await queueNotification({ deliveryId: delivery.id, trackingCode: delivery.trackingCode, eventType: input.status }) : null; return { delivery, notification }; }),
    demoUpdateStatus: publicProcedure.input(statusUpdateInput).mutation(async ({ input }) => { const delivery = await updateDeliveryStatus(input.id, input.status, input.note); const notification = delivery ? await queueNotification({ deliveryId: delivery.id, trackingCode: delivery.trackingCode, eventType: input.status }) : null; return { delivery, notification, demo: true }; }),
    demoMarkNearby: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { const delivery = await recordPostmanNearby(input.id); const notification = delivery ? await queueNotification({ deliveryId: delivery.id, trackingCode: delivery.trackingCode, eventType: "postman_nearby" }) : null; return { delivery, notification, demo: true }; }),
    listProofs: protectedProcedure.input(z.object({ deliveryId: z.string().min(1).max(80) })).query(({ ctx, input }) => listDeliveryProofs(ctx.user.id, input.deliveryId)),
    uploadProof: protectedProcedure.input(z.object({ deliveryId: z.string().min(1).max(80), fileName: z.string().min(1).max(160), mimeType: z.string().min(1).max(120), dataUrl: z.string().min(1).max(7_100_000) })).mutation(async ({ ctx, input }) => { const bytes = decodeProofDataUrl(input.dataUrl, input.mimeType); const fileName = cleanFileName(input.fileName); const stored = await storagePut(`delivery-proofs/${ctx.user.id}/${input.deliveryId}/${fileName}`, bytes, input.mimeType); return saveDeliveryProof({ userId: ctx.user.id, deliveryId: input.deliveryId, fileName, fileKey: stored.key, fileUrl: stored.url, mimeType: input.mimeType, sizeBytes: bytes.length }); })
  }),
  operations: router({ snapshot: publicProcedure.input(z.object({ latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional() })).query(({ input }) => getOperationalSnapshot(input.latitude, input.longitude)) })
});

export type AppRouter = typeof appRouter;
