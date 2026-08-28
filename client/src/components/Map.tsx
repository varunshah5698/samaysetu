/// <reference types="@types/google.maps" />
/* Google Maps proxy integration with a single shared loader and no script-removal race. */
import { useEffect, useRef, useState, type ReactNode } from "react";

declare global { interface Window { google?: typeof google; } }
let mapsPromise: Promise<void> | null = null;

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY; const baseUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev"; const url = `${baseUrl.replace(/\/$/, "")}/v1/maps/proxy/maps/api/js?key=${apiKey}&v=weekly&loading=async&libraries=marker,places,geocoding,geometry`;
  mapsPromise = new Promise((resolve, reject) => {
    const startedAt = Date.now(); const waitForSdk = () => { if (window.google?.maps?.Map) { resolve(); return; } if (Date.now() - startedAt > 9_000) { mapsPromise = null; reject(new Error("Map SDK unavailable")); return; } window.setTimeout(waitForSdk, 120); };
    const existing = document.querySelector<HTMLScriptElement>('script[data-parcel-path-maps="true"]');
    if (!existing) { const script = document.createElement("script"); script.src = url; script.async = true; script.crossOrigin = "anonymous"; script.dataset.parcelPathMaps = "true"; document.head.appendChild(script); }
    waitForSdk();
  });
  return mapsPromise;
}

export type MapViewProps = { className?: string; initialCenter: google.maps.LatLngLiteral; initialZoom?: number; onMapReady?: (map: google.maps.Map) => void; fallback?: ReactNode; };
export function MapView({ className = "", initialCenter, initialZoom = 12, onMapReady, fallback }: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null); const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => { let disposed = false; const initialise = () => { if (disposed || !ref.current || !window.google?.maps) return; const map = new window.google.maps.Map(ref.current, { center: initialCenter, zoom: initialZoom, mapTypeControl: false, fullscreenControl: false, streetViewControl: false, zoomControl: true, gestureHandling: "cooperative", clickableIcons: false, styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }, { featureType: "transit", stylers: [{ visibility: "off" }] }, { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#841d25" }] }, { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#c9252d" }, { lightness: 55 }] }, { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#fff6d4" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e0a41a" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#ffffff" }] }] }); try { onMapReady?.(map); } catch (error) { console.warn("[Live map route layer]", error); } setStatus("ready"); }; loadGoogleMaps().then(initialise).catch(() => { if (!disposed) setStatus("error"); }); return () => { disposed = true; }; }, [initialCenter, initialZoom, onMapReady]);
  return <div className={`live-map-shell ${className}`}><div className={`live-map-surface ${status === "ready" ? "is-ready" : ""}`} ref={ref} />{status !== "ready" && fallback}<span className={`live-map-label ${status === "error" ? "fallback" : ""}`}>{status === "loading" ? "Loading live route map…" : "Route diagram shown while the live map reconnects"}</span></div>;
}
