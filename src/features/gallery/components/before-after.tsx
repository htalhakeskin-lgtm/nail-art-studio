"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Before / after slider (V-07, REQ-007). A native range input lies over both photos, so touch,
 * mouse and arrow keys work everywhere and screen readers hear "slider" with a spoken value.
 * The "after" photo is revealed with clip-path (no transition: nothing animates but the user).
 */
export function BeforeAfter({
  before,
  after,
  title,
  sizes,
}: {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  title: string;
  sizes: string;
}) {
  const [position, setPosition] = useState(50);
  return (
    <figure className="space-y-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-surface-muted select-none">
        <Image src={before.src} alt={before.alt} fill sizes={sizes} className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${String(position)}%)` }}>
          <Image src={after.src} alt={after.alt} fill sizes={sizes} className="object-cover" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-surface shadow"
          style={{ left: `${String(position)}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-brand shadow-glow">
            ⇆
          </span>
        </div>
        <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-surface/90 px-2.5 py-0.5 text-xs font-semibold">
          Öncesi
        </span>
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-surface/90 px-2.5 py-0.5 text-xs font-semibold">
          Sonrası
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={(event) => {
            setPosition(Number(event.currentTarget.value));
          }}
          aria-label={`Öncesi ve sonrası karşılaştırma: ${title}`}
          aria-valuetext={`Sonrası yüzde ${String(100 - position)} görünüyor`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="text-sm text-muted-foreground">
        Kaydırarak ya da ok tuşlarıyla karşılaştırın.
      </figcaption>
    </figure>
  );
}
