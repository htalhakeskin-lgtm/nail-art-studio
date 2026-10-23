"use client";

import { type ReactNode, type RefObject, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export type DrawerHandle = { open: () => void; close: () => void };

const nativeCommands =
  typeof HTMLButtonElement !== "undefined" && "commandForElement" in HTMLButtonElement.prototype;

/**
 * Trigger attributes: browsers with invoker commands open the drawer natively, even before
 * hydration (a tap on a slow line is never lost). Pair with onClick={() => openDrawer(ref)}.
 */
export function drawerTrigger(id: string): Record<string, string> {
  // Not in React's types yet; React passes unknown lowercase attributes through.
  return { commandfor: id, command: "show-modal", "aria-haspopup": "dialog" };
}

/** Click fallback for browsers without invoker commands. */
export function openDrawer(drawer: RefObject<DrawerHandle | null>) {
  if (!nativeCommands) drawer.current?.open();
}

/**
 * Side or bottom drawer on a native modal <dialog> (K-43): the browser provides the focus trap
 * (the rest of the page is inert), Esc and the backdrop; focus goes back to `returnFocus` on
 * close; scroll lock is CSS (`body:has(.drawer[open])`). Replaces a dialog library that every
 * page used to load for the phone menu.
 */
export function Drawer({
  ref,
  id,
  side,
  labelledBy,
  returnFocus,
  className,
  children,
}: {
  ref: RefObject<DrawerHandle | null>;
  /** Lets a button open it without JavaScript: {...drawerTrigger(id)} (invoker commands). */
  id: string;
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
      id={id}
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
