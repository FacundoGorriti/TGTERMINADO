"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ThemePreference = "light" | "dark" | "system";
export const THEME_KEY = "tgo:theme";

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  const value = document.documentElement.getAttribute("data-theme-pref");
  return value === "light" || value === "dark" ? value : "system";
}

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(pref: ThemePreference) {
  const dark = pref === "dark" || (pref === "system" && systemPrefersDark());
  const root = document.documentElement;
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.setAttribute("data-theme-pref", pref);
  root.style.colorScheme = dark ? "dark" : "light";
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readPreference() === "system") applyTheme("system");
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;
    const v = event.newValue;
    applyTheme(v === "light" || v === "dark" ? v : "system");
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTheme() {
  const preference = useSyncExternalStore<ThemePreference>(subscribe, readPreference, () => "system");
  const setPreference = useCallback((pref: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_KEY, pref);
    } catch {
      /* almacenamiento bloqueado: el tema se aplica solo en esta sesión */
    }
    applyTheme(pref);
  }, []);
  return { preference, setPreference };
}
