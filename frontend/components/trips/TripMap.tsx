"use client";

import { useEffect, useRef } from "react";

// Lightweight placeholder for Mapbox; wire real mapbox-gl later.
export default function TripMap() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    // In production, initialize mapbox-gl here with the trip route.
  }, []);

  return (
    <div
      ref={ref}
      className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(79,255,176,0.18),_transparent_55%),_radial-gradient(circle_at_bottom_right,_rgba(217,119,6,0.5),_transparent_55%),_#020617] flex items-center justify-center text-xs text-ghost-white/70"
    >
      <div className="rounded-2xl bg-black/40 px-3 py-2 ring-1 ring-white/10">
        Interactive Mapbox route placeholder · Flight → hotel → experiences
      </div>
    </div>
  );
}
