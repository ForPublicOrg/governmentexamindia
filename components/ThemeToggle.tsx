"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "theme";
const THEME_COLORS: Record<Theme, string> = {
  light: "#f7f5ef",
  dark: "#0b141b",
};

function applyTheme(theme: Theme) {
  const dark = theme === "dark";
  const nextTheme = dark ? "light" : "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);

  const toggle = document.querySelector<HTMLElement>("[data-theme-toggle]");
  toggle?.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  toggle?.setAttribute("title", `Switch to ${nextTheme} mode`);
}

function storedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function preferredTheme(): Theme {
  const saved = storedTheme();
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  useEffect(() => {
    applyTheme(preferredTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemTheme = (event: MediaQueryListEvent) => {
      if (!storedTheme()) applyTheme(event.matches ? "dark" : "light");
    };
    const handleStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_KEY) return;
      applyTheme(event.newValue === "light" || event.newValue === "dark" ? event.newValue : preferredTheme());
    };

    media.addEventListener("change", handleSystemTheme);
    window.addEventListener("storage", handleStoredTheme);
    return () => {
      media.removeEventListener("change", handleSystemTheme);
      window.removeEventListener("storage", handleStoredTheme);
    };
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      data-theme-toggle
      aria-label="Toggle colour theme"
      title="Toggle colour theme"
      onClick={() => {
        const nextTheme: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
        try {
          localStorage.setItem(THEME_KEY, nextTheme);
        } catch {}
        applyTheme(nextTheme);
      }}
    >
      <svg className="theme-icon-moon" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20.3 15.6A8.5 8.5 0 0 1 8.4 3.7 8.5 8.5 0 1 0 20.3 15.6Z" />
      </svg>
      <svg className="theme-icon-sun" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
