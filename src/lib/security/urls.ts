/**
 * VALIDACIÓN CENTRALIZADA DE ENLACES
 * ---------------------------------------------------------------------------
 * Toda URL que llega al HTML desde el catálogo o la configuración debe pasar por
 * estas funciones. Reglas:
 * - Sitios externos: solo `https:`; sin credenciales embebidas; host válido.
 * - `tel:` y WhatsApp se construyen aquí a partir de dígitos, nunca se aceptan crudos.
 * - Se rechazan `javascript:`, `data:`, `vbscript:`, `file:` y cualquier esquema inesperado.
 */

const MAX_URL_LENGTH = 2048;

/** Hosts permitidos para redes y mapas (coincidencia exacta o subdominio). */
export const TRUSTED_HOSTS = {
  instagram: ["instagram.com"],
  facebook: ["facebook.com", "fb.com"],
  maps: ["google.com", "google.com.ar", "maps.google.com", "maps.app.goo.gl", "goo.gl"],
} as const;

export type TrustedHostGroup = keyof typeof TRUSTED_HOSTS;

// Caracteres de control y espacios invisibles que algunos navegadores ignoran
// al interpretar esquemas (ej. "java\tscript:").
const CONTROL_CHARS = new RegExp("[\u0000-\u001F\u007F-\u009F\u200B-\u200D\u2028\u2029\uFEFF]");

function hostMatches(hostname: string, allowed: readonly string[]): boolean {
  const host = hostname.toLowerCase();
  return allowed.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function isValidHostname(hostname: string): boolean {
  if (!hostname || hostname.length > 253) return false;
  // Rechazar IPs literales y hosts sin TLD: los negocios usan dominios públicos.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith("[")) return false;
  if (!hostname.includes(".")) return false;
  return hostname.split(".").every((label) => /^(?!-)[a-z0-9-]{1,63}(?<!-)$/i.test(label) || /^xn--/i.test(label));
}

/**
 * Devuelve la URL normalizada si es un enlace https seguro, o null.
 * Con `allowedHosts` restringe el dominio (ej. solo instagram.com).
 */
export function safeHttpsUrl(input: unknown, allowedHosts?: readonly string[]): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > MAX_URL_LENGTH || CONTROL_CHARS.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== "443") return null;
  if (!isValidHostname(url.hostname)) return null;
  if (allowedHosts && !hostMatches(url.hostname, allowedHosts)) return null;

  return url.toString();
}

export function safeTrustedUrl(input: unknown, group: TrustedHostGroup): string | null {
  return safeHttpsUrl(input, TRUSTED_HOSTS[group]);
}

/** Extrae solo los dígitos de un teléfono. */
export function phoneDigits(input: unknown): string | null {
  if (typeof input !== "string") return null;
  if (!/^[+\d\s().-]{6,25}$/.test(input.trim())) return null;
  const digits = input.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15 ? digits : null;
}

/** Construye un enlace `tel:` seguro. Conserva el "+" inicial si existe. */
export function buildTelHref(input: unknown): string | null {
  const digits = phoneDigits(input);
  if (!digits || typeof input !== "string") return null;
  return `tel:${input.trim().startsWith("+") ? "+" : ""}${digits}`;
}

/**
 * Construye un enlace de WhatsApp (wa.me) a partir de un número internacional.
 * El número debe incluir código de país (ej. 549387...). El texto opcional se codifica.
 */
export function buildWhatsAppHref(input: unknown, message?: string): string | null {
  const digits = phoneDigits(input);
  if (!digits || digits.length < 10) return null;
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  const text = message.slice(0, 500);
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** Construye un enlace `mailto:` seguro para una dirección simple. */
export function buildMailtoHref(input: unknown, subject?: string): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim();
  if (email.length > 254 || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) return null;
  const base = `mailto:${email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject.slice(0, 200))}` : base;
}

/** Ruta interna segura: debe comenzar con "/" y no con "//" (evita open redirects). */
export function safeInternalPath(input: unknown): string | null {
  if (typeof input !== "string") return null;
  if (!input.startsWith("/") || input.startsWith("//") || input.includes("\\")) return null;
  if (CONTROL_CHARS.test(input)) return null;
  return input;
}

/** Texto legible para mostrar un dominio (ej. "www.ejemplo.com"). */
export function displayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
