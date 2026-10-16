/**
 * First focusable element on every public page (08-erisilebilirlik). Parked above the viewport
 * instead of sr-only: Tailwind's not-sr-only resets padding, which shrank the focused link
 * below the 44 px target.
 */
export function SkipLink() {
  return (
    <a
      href="#icerik"
      className="fixed top-3 left-3 z-50 inline-flex min-h-11 -translate-y-24 items-center rounded-md bg-primary px-4 font-semibold text-primary-foreground transition-transform duration-(--duration-fast) focus:translate-y-0"
    >
      İçeriğe geç
    </a>
  );
}
