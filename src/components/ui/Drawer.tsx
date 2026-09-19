"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TbX } from "react-icons/tb";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: "right" | "left";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Slide-over panel used for the cart and the mobile filter sheet.
 *
 * Handles the three things an overlay must get right: background scroll lock,
 * Escape to close, and moving focus into the panel on open (with every listener
 * removed on close).
 */
export function Drawer({ open, onClose, title, side = "right", children, footer, className }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /**
   * Stays mounted when closed so the slide transition can run, but:
   *   - `overflow-hidden` clips the off-canvas panel. Without it the panel,
   *     translated 100% past the right edge, extends the document's scroll
   *     width and the page scrolls sideways on mobile with the panel visible.
   *   - `inert` takes the closed panel out of the tab order and the
   *     accessibility tree, which `pointer-events-none` alone does not do.
   */
  const overlay = (
    <div className={cn("fixed inset-0 z-50 overflow-hidden", !open && "pointer-events-none")} inert={!open}>
      <div
        className={cn(
          "absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label={typeof title === "string" ? title : "Panel"}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-full max-w-md flex-col bg-surface shadow-elevated transition-transform duration-300 ease-out outline-none",
          side === "right" ? "right-0" : "left-0",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full",
          className,
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="grid size-9 place-items-center rounded-pill text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <TbX className="size-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer && <div className="border-t border-[var(--border)] bg-surface px-5 py-4">{footer}</div>}
      </div>
    </div>
  );

  /**
   * Rendered into `document.body` rather than in place.
   *
   * `position: fixed` resolves against the viewport only while no ancestor
   * creates a containing block - and the site header does exactly that with
   * `backdrop-blur`. Left in the header, the mobile navigation drawer was
   * clamped to the header's own 118px height instead of filling the screen.
   * A portal makes the drawer independent of wherever it is triggered from.
   */
  if (!hydrated) return null;
  return createPortal(overlay, document.body);
}
