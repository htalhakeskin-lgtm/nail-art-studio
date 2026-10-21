"use client";

import { useEffect, useRef } from "react";

/**
 * Hidden fields for every public form (11-guvenlik §9). Bots fill "website"; humans never see it.
 * formStartedAt lets the server reject forms submitted faster than a person can type.
 * The time is written in the browser after the form appears: with Cache Components a value
 * computed during render would be frozen at build time and the check would never trigger.
 * With React Hook Form, register both fields and send them with the values.
 */
export function SpamGuard() {
  const startedAt = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now());
  }, []);
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Web siteniz (boş bırakın)
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
      <input ref={startedAt} type="hidden" name="formStartedAt" defaultValue="" />
    </div>
  );
}
