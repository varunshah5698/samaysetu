export function createQuickBookingPayload(input: { area: string; day: string; time: string; selectedSlot: string; latitude: number; longitude: number }) {
  return { area: input.area.trim(), latitude: input.latitude, longitude: input.longitude, day: input.day, time: input.time, festival: false, selectedSlot: input.selectedSlot };
}
