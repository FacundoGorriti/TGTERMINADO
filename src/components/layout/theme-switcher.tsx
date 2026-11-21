"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/hooks/use-theme";
import { cn } from "@/lib/utils/cn";

const OPTIONS: Array<{ value: ThemePreference; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Oscuro", Icon: Moon },
  { value: "system", label: "Automático", Icon: Monitor },
];

/** Botón compacto que alterna claro → oscuro → automático. */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  const index = OPTIONS.findIndex((o) => o.value === preference);
  const current = OPTIONS[index] ?? OPTIONS[2]!;
  const next = OPTIONS[(index + 1) % OPTIONS.length]!;
  const Icon = current.Icon;
  return (
    <button
      type="button"
      onClick={() => setPreference(next.value)}
      className={cn(
        "tap-target inline-grid place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg",
        className,
      )}
      aria-label={`Tema: ${current.label}. Cambiar a ${next.label.toLowerCase()}`}
      title={`Tema: ${current.label}`}
      data-testid="theme-toggle"
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}

/** Selector completo (grupo de opciones) para el pie de página. */
export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();
  return (
    <fieldset className="inline-flex rounded-full border border-line bg-surface p-1">
      <legend className="sr-only">Tema de color</legend>
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value;
        return (
          <label
            key={value}
            className={cn(
              "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--t-focus)]",
              active ? "bg-accent text-accent-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={active}
              onChange={() => setPreference(value)}
              className="sr-only"
            />
            <Icon aria-hidden className="size-3.5" />
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}
