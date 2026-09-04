"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function onScroll() {
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      setWidth(max > 0 ? Math.min(100, (d.scrollTop / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="progress chrome" aria-hidden="true" style={{ width: `${width}%` }} />;
}
