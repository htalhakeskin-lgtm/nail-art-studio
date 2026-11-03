/**
 * The maker's credit in the footer's last row, opposite the demo note (17 §3 IC-07, 06 AR-08).
 * Styled like the header's owner kicker (same small tracked label the site already uses), not a
 * generic badge. "Created by" is English: `lang="en"` so a Turkish reader's screen reader and
 * the page's CSS uppercase don't mangle it (KURALLAR C).
 */
export function SiteCredit({ className }: { className?: string }) {
  return (
    <p
      className={
        className ??
        "shrink-0 text-[0.7rem] tracking-[0.2em] text-muted-foreground uppercase sm:ml-auto"
      }
    >
      <span lang="en">Created by</span> <span className="text-foreground">Talha Keskin</span>
    </p>
  );
}
