"use client";

import { type ReactNode, type RefObject, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export type DrawerHandle = { open: () => void; close: () => void };

/**
 * Side or bottom drawer on a native modal <dialog> (K-43): the browser provides the focus trap
 * (the rest of the page is inert), Esc and the backdrop; focus goes back to `returnFocus` on
 * close; scroll lock is CSS (`body:has(.drawer[open])`). Replaces a dialog library that every
 * page used to load for the phone menu.
 */
export function Drawer({
  ref,
  side,
  labelledBy,
  returnFocus,
  className,
  children,
}: {
  ref: RefObject<DrawerHandle | null>;
  side: "right" | "bottom";
  labelledBy: string;
  returnFocus?: RefObject<HTMLElement | null>;
  className?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => ({
    open: () => dialog.current?.showModal(),
    close: () => dialog.current?.close(),
  }));

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop click; keyboards close with the native Esc
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      data-side={side}
      className={cn("drawer", className)}
      onClose={() => returnFocus?.current?.focus()}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself, never on its content.
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      {children}
    </dialog>
  );
}
