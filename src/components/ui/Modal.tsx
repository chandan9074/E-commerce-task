"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TbX } from "react-icons/tb";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils/cn";

/**
 * Centred dialog (product quick view).
 *
 * Unmounts entirely when closed - unlike the drawer it has no slide-out
 * transition to wait for, and keeping a fetched product mounted would hold on
 * to data the user has dismissed.
 */
export function Modal({
  open,
  onClose,
  label,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
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

  if (!open || !hydrated) return null;

  // Portalled to `document.body` so no transformed or blurred ancestor can
  // become the containing block for this fixed overlay - see Drawer.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[92vh] w-full max-w-3xl animate-fade-up overflow-y-auto rounded-t-3xl bg-surface shadow-elevated outline-none sm:rounded-card",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-pill bg-surface/90 text-muted backdrop-blur transition-colors hover:text-foreground"
        >
          <TbX className="size-5" aria-hidden />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
}
