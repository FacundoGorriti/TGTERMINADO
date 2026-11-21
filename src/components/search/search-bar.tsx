"use client";

import { useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  /** Modo controlado (Explorar): el valor vive en el componente padre. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Modo formulario (Inicio): envía GET a /explorar/?q=... (funciona sin JavaScript). */
  defaultValue?: string;
  action?: string;
  placeholder?: string;
  size?: "md" | "lg";
  label?: string;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onValueChange,
  defaultValue = "",
  action = "/explorar/",
  placeholder = "Buscá negocios, rubros o servicios",
  size = "md",
  label = "Buscar en el directorio",
  className,
  autoFocus,
}: SearchBarProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = controlled ? value : internal;

  const setValue = (v: string) => {
    if (controlled) onValueChange?.(v);
    else setInternal(v);
  };

  const field = (
    <div className={cn("relative flex items-center", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search aria-hidden className={cn("pointer-events-none absolute left-4 text-fg-subtle", size === "lg" ? "size-5" : "size-[1.1rem]")} />
      <input
        ref={inputRef}
        id={id}
        name="q"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        maxLength={100}
        autoFocus={autoFocus}
        value={current}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && current) {
            e.preventDefault();
            setValue("");
          }
        }}
        placeholder={placeholder}
        className={cn(
          "w-full appearance-none rounded-full border border-line-strong bg-surface text-fg shadow-card outline-none placeholder:text-fg-subtle",
          "transition-[border-color,box-shadow] focus:border-accent focus:ring-4 focus:ring-accent/15 [&::-webkit-search-cancel-button]:hidden",
          size === "lg" ? "h-14 pr-28 pl-12 text-base sm:h-16 sm:text-lg" : "h-12 pr-12 pl-11",
        )}
      />
      {current && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Limpiar búsqueda"
          className={cn(
            "tap-target absolute grid place-items-center rounded-full text-fg-subtle hover:text-fg",
            size === "lg" ? "right-24" : "right-1",
          )}
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
      {!controlled && size === "lg" && (
        <button type="submit" className="absolute right-2 inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg hover:bg-accent-hover sm:h-12">
          Buscar
        </button>
      )}
    </div>
  );

  if (controlled) return field;
  return (
    <form role="search" action={action} method="get" aria-label={label}>
      {field}
    </form>
  );
}
