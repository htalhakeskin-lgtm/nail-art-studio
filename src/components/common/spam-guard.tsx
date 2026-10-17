"use client";

import { useState } from "react";

/**
 * Hidden fields for every public form (11-guvenlik §9). Bots fill "website"; humans never see it.
 * formStartedAt lets the server reject forms submitted faster than a person can type.
 * With React Hook Form, register both fields and send them with the values.
 */
export function SpamGuard() {
  const [startedAt] = useState(() => Date.now());
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label>
        Web siteniz (boş bırakın)
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
      <input type="hidden" name="formStartedAt" value={startedAt} />
    </div>
  );
}
