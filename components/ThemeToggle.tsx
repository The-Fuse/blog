"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function ThemeToggle({ className = "theme-btn chrome" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark");

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("kit-theme", next);
  }

  return (
    <button type="button" className={className} onClick={toggle}>
      {theme === "dark" ? "◐ Light" : "◑ Dark"}
    </button>
  );
}
