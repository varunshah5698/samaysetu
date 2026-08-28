export type RoutePoint = { id: string; lat: number; lng: number; status?: string };
const earthRadiusKm = 6371;
const distanceKm = (a: RoutePoint, b: RoutePoint) => { const radians = (value: number) => value * Math.PI / 180; const dLat = radians(b.lat - a.lat); const dLng = radians(b.lng - a.lng); const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2; return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)); };
export function toDelhiMapPosition(latitude: number, longitude: number) { return { x: Math.min(88, Math.max(12, 48 + (longitude - 77.219) * 165)), y: Math.min(87, Math.max(13, 50 - (latitude - 28.632) * 150)) }; }
export function spreadOverlappingDots<T extends RoutePoint & { x: number; y: number }>(stops: T[]) { const seen = new Map<string, number>(); return stops.map(stop => { const key = `${stop.lat.toFixed(3)}:${stop.lng.toFixed(3)}`; const count = seen.get(key) ?? 0; seen.set(key, count + 1); if (!count) return stop; const column = (count % 5) - 2; const row = Math.floor(count / 5) - 1; return { ...stop, lat: stop.lat + row * .0012, lng: stop.lng + column * .0012, x: Math.min(90, Math.max(10, stop.x + column * 4.6)), y: Math.min(90, Math.max(10, stop.y + row * 4.6)) }; }); }

export function buildShortestRoute<T extends RoutePoint>(stops: T[], selectedId?: string, routeOriginId?: string) {
  const hub = stops.find(stop => stop.status === "hub") ?? stops[0]; if (!hub) return { orderedStops: [] as T[], estimatedKm: 0 };
  const selected = stops.find(stop => stop.id === selectedId && stop.id !== hub.id); const origin = routeOriginId ? stops.find(stop => stop.id === routeOriginId && stop.id !== selected?.id) : hub; const orderedStops: T[] = selected && origin ? [origin, selected] : [];
  const estimatedKm = orderedStops.slice(1).reduce((total, stop, index) => total + distanceKm(orderedStops[index], stop), 0);
  return { orderedStops, estimatedKm: Math.round(estimatedKm * 10) / 10 };
}
