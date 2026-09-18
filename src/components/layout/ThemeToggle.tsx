"use client";

import { useCallback } from "react";
import { TbMoon, TbSun } from "react-icons/tb";

const STORAGE_KEY = "aurelia.theme";

/**
 * Light/dark toggle.
 *
 * Deliberately stateless: the `dark` class on `<html>` is the state, applied
 * before first paint by the inline script below. Both icons are rendered and
 * CSS picks one (`dark:hidden` / `hidden dark:block`), so there is nothing to
 * hydrate, no mismatch to suppress, and no re-render on toggle.
 */
export function ThemeToggle() {
  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Storage unavailable - the choice simply will not survive a reload.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="grid size-10 place-items-center rounded-pill text-foreground transition-colors hover:bg-surface-muted"
    >
      <TbSun className="size-5 dark:hidden" aria-hidden />
      <TbMoon className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}

/** Runs before first paint to prevent a flash of the wrong theme. */
export const themeScript = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
