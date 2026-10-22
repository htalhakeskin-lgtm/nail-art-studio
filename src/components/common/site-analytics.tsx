"use client";

import { track } from "@vercel/analytics";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { useEffect } from "react";

import { type AnalyticsEvent, eventForLink, redactPath, redactUrl } from "@/lib/analytics";

function beforeSend(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: redactUrl(event.url) };
}

/**
 * Cookieless page views + conversion clicks (REQ-021, K-13). One click listener for the whole
 * site: links are classified by where they go, so no component has to remember to report.
 * Rendered only on Vercel, where the script is served from the site's own origin.
 */
export function SiteAnalytics() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      const href = link?.getAttribute("href");
      if (!href) return;
      const name = eventForLink(href, window.location.pathname);
      if (name) track(name, { from: redactPath(window.location.pathname) });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return <Analytics beforeSend={beforeSend} />;
}

/** A conversion that is a page, not a click: the booking or contact confirmation. */
export function TrackEvent({ name }: { name: AnalyticsEvent }) {
  useEffect(() => {
    track(name, { from: redactPath(window.location.pathname) });
  }, [name]);
  return null;
}
