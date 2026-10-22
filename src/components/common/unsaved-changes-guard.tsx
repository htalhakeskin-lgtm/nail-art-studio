"use client";

import { useEffect, useRef } from "react";

const QUESTION =
  "Kaydedilmemiş değişiklikleriniz var. Sayfadan çıkarsanız kaybolacak. Çıkılsın mı?";

/**
 * Unsaved changes warning for panel forms (U-26, REQ-022). Put it anywhere inside a <form>: once
 * a field changes, closing the tab asks the browser's own question and in-app links ask first;
 * submitting the form clears the warning.
 */
export function UnsavedChangesGuard() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = marker.current?.closest("form");
    if (!form) return;
    let dirty = false;

    const markDirty = () => {
      dirty = true;
    };
    // After the whole dispatch: a client-side validation error prevents the submit, keep dirty.
    const markClean = (event: SubmitEvent) => {
      setTimeout(() => {
        if (!event.defaultPrevented) dirty = false;
      });
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    // Capture phase: runs before next/link, which skips navigation when the default is prevented.
    const onClick = (event: MouseEvent) => {
      if (!dirty || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }
      if (!window.confirm(QUESTION)) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        dirty = false;
      }
    };

    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", markClean);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", markClean);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  return <span ref={marker} hidden />;
}
