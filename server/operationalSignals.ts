import { makeRequest, type DirectionsResult } from "./_core/map";

export type OperationalSnapshot = {
  weather: { temperatureC: number; precipitationMm: number; windKph: number; label: string; scoreImpact: number; source: string };
  traffic: { durationMinutes: number | null; delayMinutes: number | null; label: string; scoreImpact: number; source: string };
  notifications: { whatsapp: "provider_required"; sms: "provider_required"; eventHooks: string[] };
  checkedAt: number;
};

let cache: { key: string; expiresAt: number; value: OperationalSnapshot } | null = null;

function weatherLabel(code: number, precipitation: number) {
  if (precipitation >= 0.2 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return "Wet-route watch";
  if (code === 0 || code === 1) return "Clear route conditions";
  return "Variable route conditions";
}

export async function getOperationalSnapshot(latitude = 28.6139, longitude = 77.2090): Promise<OperationalSnapshot> {
  const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  if (cache && cache.key === key && cache.expiresAt > Date.now()) return cache.value;
  const weatherRequest = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=Asia%2FKolkata`).then(async response => {
    if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
    return response.json() as Promise<{ current?: { temperature_2m?: number; precipitation?: number; wind_speed_10m?: number; weather_code?: number } }>;
  });
  const trafficRequest = makeRequest<DirectionsResult>("/maps/api/directions/json", { origin: `${latitude},${longitude}`, destination: "28.632,77.219", mode: "driving", departure_time: "now", traffic_model: "best_guess", alternatives: "false" });
  const [weatherResult, trafficResult] = await Promise.allSettled([weatherRequest, trafficRequest]);
  const current = weatherResult.status === "fulfilled" ? weatherResult.value.current ?? {} : {};
  const precipitation = Number(current.precipitation ?? 0); const wind = Number(current.wind_speed_10m ?? 0); const weatherCode = Number(current.weather_code ?? 0); const weatherImpact = Math.min(8, (precipitation >= 0.2 ? 5 : 0) + (wind >= 32 ? 3 : 0));
  const leg = trafficResult.status === "fulfilled" ? trafficResult.value.routes?.[0]?.legs?.[0] : undefined; const rawLeg = leg as unknown as { duration?: { value?: number }; duration_in_traffic?: { value?: number } } | undefined; const durationMinutes = rawLeg?.duration?.value ? Math.round(rawLeg.duration.value / 60) : null; const trafficDuration = rawLeg?.duration_in_traffic?.value ? Math.round(rawLeg.duration_in_traffic.value / 60) : durationMinutes; const delayMinutes = durationMinutes !== null && trafficDuration !== null ? Math.max(0, trafficDuration - durationMinutes) : null; const trafficImpact = delayMinutes === null ? 0 : Math.min(8, Math.ceil(delayMinutes / 4));
  const value: OperationalSnapshot = { weather: { temperatureC: Math.round(Number(current.temperature_2m ?? 0)), precipitationMm: precipitation, windKph: Math.round(wind), label: weatherResult.status === "fulfilled" ? weatherLabel(weatherCode, precipitation) : "Weather signal unavailable", scoreImpact: weatherImpact, source: "Open-Meteo operational observation" }, traffic: { durationMinutes: trafficDuration, delayMinutes, label: trafficResult.status === "fulfilled" ? delayMinutes && delayMinutes > 3 ? "Traffic delay factored" : "Traffic timing normal" : "Traffic timing unavailable", scoreImpact: trafficImpact, source: "Google route timing" }, notifications: { whatsapp: "provider_required", sms: "provider_required", eventHooks: ["booking_confirmed", "out_for_delivery", "delivered", "rescheduled"] }, checkedAt: Date.now() };
  cache = { key, expiresAt: Date.now() + 120_000, value };
  return value;
}
