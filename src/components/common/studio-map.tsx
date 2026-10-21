"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";

type StudioMapProps = {
  lat: number;
  lng: number;
  label: string;
  className?: string;
};

/**
 * MapLibre + OpenFreeMap (plan §10, §17): no key, no cookies, so no consent is needed (K-13).
 * The library (~250 kB gzip) loads only when the map scrolls into view; until then, and if it
 * fails, a pastel placeholder keeps the space. The address is always written next to the map,
 * so the map itself is supplementary for screen readers.
 */
export function StudioMap({ lat, lng, label, className }: StudioMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "ready" | "failed">("idle");

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let map: { remove(): void } | undefined;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void import("maplibre-gl")
          .then((maplibregl) => {
            if (cancelled) return;
            // Served by scripts/copy-vendor.mjs: the bundled default worker URL does not resolve.
            maplibregl.setWorkerUrl(`/vendor/maplibre-gl-worker-${maplibregl.getVersion()}.mjs`);
            const instance = new maplibregl.Map({
              container: element,
              style: "https://tiles.openfreemap.org/styles/liberty",
              center: [lng, lat],
              zoom: 15,
              cooperativeGestures: true,
              attributionControl: { compact: true },
            });
            instance.addControl(new maplibregl.NavigationControl({ showCompass: false }));
            // The marker takes a literal colour: read the brand token instead of hard-coding it.
            const brand = getComputedStyle(element).getPropertyValue("--brand").trim();
            new maplibregl.Marker({ color: brand || undefined })
              .setLngLat([lng, lat])
              .addTo(instance);
            instance.once("load", () => {
              setState("ready");
            });
            instance.on("error", () => {
              setState((current) => (current === "ready" ? current : "failed"));
            });
            map = instance;
          })
          .catch(() => {
            setState("failed");
          });
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [lat, lng]);

  return (
    <div className={className}>
      <div
        ref={container}
        role="region"
        aria-label={`Harita: ${label}`}
        className="relative h-72 w-full overflow-hidden rounded-[1.5rem] bg-linear-to-br from-lila via-surface-muted to-nane md:h-96"
      >
        {state !== "ready" && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-semibold text-muted-foreground">
            {state === "failed" ? "Harita şu an yüklenemedi." : "Harita yükleniyor…"}
          </p>
        )}
      </div>
    </div>
  );
}
