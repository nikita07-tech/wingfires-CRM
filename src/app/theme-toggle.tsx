"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--sidebar-text)", padding: "8px 0", borderRadius: 8, cursor: "pointer", width: "100%", marginBottom: 8 }}
    >
      {dark ? "☀️ Light mode" : "🌙 Dark mode"}
    </button>
  );
}
