import type { ComponentProps } from "react";

import { formatPhone } from "@/lib/format";

/** The one way to show a phone number (06-arayuz §6): E.164 in, "0542 311 58 88" out. */
export function PhoneLink({
  e164,
  ...props
}: { e164: string } & Omit<ComponentProps<"a">, "href" | "children">) {
  return (
    <a href={`tel:${e164}`} {...props}>
      {formatPhone(e164)}
    </a>
  );
}
