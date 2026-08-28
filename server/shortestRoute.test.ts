import { describe, expect, it } from "vitest";
import { buildShortestRoute, spreadOverlappingDots, toDelhiMapPosition } from "../client/src/lib/shortestRoute";

describe("booking-specific shortest route", () => {
  const stops = [{ id: "hub", lat: 28.632, lng: 77.219, status: "hub" }, { id: "near", lat: 28.635, lng: 77.224, status: "pending" }, { id: "far", lat: 28.69, lng: 77.29, status: "pending" }, { id: "selected", lat: 28.52, lng: 77.206, status: "pending" }];
  it("makes the selected booking a direct hub-to-booking route", () => { const route = buildShortestRoute(stops, "selected"); expect(route.orderedStops.map(stop => stop.id)).toEqual(["hub", "selected"]); expect(route.estimatedKm).toBeGreaterThan(0); });
  it("starts the next route at the previously completed booking rather than returning to the hub", () => { const route = buildShortestRoute(stops, "selected", "near"); expect(route.orderedStops.map(stop => stop.id)).toEqual(["near", "selected"]); expect(route.estimatedKm).toBeGreaterThan(0); });
  it("returns no route when a selected booking is cleared", () => { expect(buildShortestRoute(stops).orderedStops).toEqual([]); });
  it("moves the fallback map position when a booking location changes", () => { expect(toDelhiMapPosition(28.631, 77.278)).not.toEqual(toDelhiMapPosition(28.524, 77.206)); });
  it("keeps multiple bookings at one address visible as separate dots", () => { const spread = spreadOverlappingDots([{ ...stops[0], x: 48, y: 49 }, { ...stops[1], x: 52, y: 48 }, { ...stops[1], id: "same", x: 52, y: 48 }]); expect(spread[1].x).not.toBe(spread[2].x); });
});
