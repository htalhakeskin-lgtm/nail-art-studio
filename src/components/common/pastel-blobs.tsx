import { cn } from "@/lib/utils";

/**
 * Soft pastel colour fields behind a section (K-28). Purely decorative: hidden from assistive
 * technology, never interactive, and clipped by the parent (which must be `relative` with
 * `overflow-hidden` or `overflow-clip`) so they cannot cause horizontal scrolling.
 */
export function PastelBlobs({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      <div className="absolute -top-24 -left-20 size-72 rounded-full bg-lila opacity-70 blur-3xl md:size-96" />
      <div className="absolute top-1/3 -right-24 size-80 rounded-full bg-primary opacity-40 blur-3xl md:size-[28rem]" />
      <div className="absolute -bottom-24 left-1/4 size-64 rounded-full bg-nane opacity-60 blur-3xl md:size-80" />
      <div className="absolute top-10 left-1/2 size-40 rounded-full bg-limon opacity-60 blur-3xl" />
    </div>
  );
}

/** A four-point sparkle, the studio's small decorative mark. */
export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-6 fill-current", className)}
      focusable="false"
    >
      <path d="M12 0c.9 6.4 5.6 11.1 12 12-6.4.9-11.1 5.6-12 12-.9-6.4-5.6-11.1-12-12C6.4 11.1 11.1 6.4 12 0z" />
    </svg>
  );
}
