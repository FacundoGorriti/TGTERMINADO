import { describe, expect, it } from "vitest";
import {
  buildMailtoHref,
  buildTelHref,
  buildWhatsAppHref,
  safeHttpsUrl,
  safeInternalPath,
  safeTrustedUrl,
} from "@/lib/security/urls";

describe("safeHttpsUrl", () => {
  it("acepta URLs https válidas", () => {
    expect(safeHttpsUrl("https://www.ejemplo.com.ar/menu?x=1")).toBe("https://www.ejemplo.com.ar/menu?x=1");
  });

  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "http://ejemplo.com",
    "//ejemplo.com",
    "https://user:pass@ejemplo.com",
    "https://127.0.0.1/",
    "https://localhost/",
    "https://ejemplo.com:8443/",
    "",
    "   ",
  ])("rechaza %j", (input) => {
    expect(safeHttpsUrl(input)).toBeNull();
  });

  it("rechaza valores que no son texto", () => {
    expect(safeHttpsUrl(undefined)).toBeNull();
    expect(safeHttpsUrl(null)).toBeNull();
    expect(safeHttpsUrl(42)).toBeNull();
    expect(safeHttpsUrl({ toString: () => "https://x.com" })).toBeNull();
  });

  it("rechaza URLs demasiado largas", () => {
    expect(safeHttpsUrl(`https://ejemplo.com/${"a".repeat(3000)}`)).toBeNull();
  });
});

describe("safeTrustedUrl", () => {
  it("acepta dominios permitidos y sus subdominios", () => {
    expect(safeTrustedUrl("https://www.instagram.com/negocio", "instagram")).not.toBeNull();
    expect(safeTrustedUrl("https://maps.app.goo.gl/abc", "maps")).not.toBeNull();
    expect(safeTrustedUrl("https://www.google.com/maps/place/x", "maps")).not.toBeNull();
  });

  it("rechaza dominios parecidos (phishing)", () => {
    expect(safeTrustedUrl("https://instagram.com.malicioso.io/x", "instagram")).toBeNull();
    expect(safeTrustedUrl("https://fakeinstagram.com/x", "instagram")).toBeNull();
    expect(safeTrustedUrl("https://facebook.com@evil.com/", "facebook")).toBeNull();
  });
});

describe("enlaces de contacto", () => {
  it("construye WhatsApp solo con dígitos y codifica el mensaje", () => {
    expect(buildWhatsAppHref("5493873000000")).toBe("https://wa.me/5493873000000");
    expect(buildWhatsAppHref("+54 9 387 300-0000", "Hola & chau")).toBe("https://wa.me/5493873000000?text=Hola%20%26%20chau");
  });

  it("rechaza números de WhatsApp inválidos", () => {
    expect(buildWhatsAppHref("123")).toBeNull();
    expect(buildWhatsAppHref("javascript:alert(1)")).toBeNull();
    expect(buildWhatsAppHref("5493873000000?text=x")).toBeNull();
  });

  it("construye tel: seguros", () => {
    expect(buildTelHref("+54 387 400-0000")).toBe("tel:+543874000000");
    expect(buildTelHref("(0387) 400-0000")).toBe("tel:03874000000");
    expect(buildTelHref("tel:123;javascript:alert(1)")).toBeNull();
  });

  it("construye mailto: solo con direcciones simples", () => {
    expect(buildMailtoHref("hola@ejemplo.com", "Consulta")).toBe("mailto:hola@ejemplo.com?subject=Consulta");
    expect(buildMailtoHref("hola@ejemplo.com?bcc=otro@x.com")).toBeNull();
    expect(buildMailtoHref("no es un mail")).toBeNull();
  });

  it("valida rutas internas (evita open redirects)", () => {
    expect(safeInternalPath("/explorar/")).toBe("/explorar/");
    expect(safeInternalPath("//evil.com")).toBeNull();
    expect(safeInternalPath("https://evil.com")).toBeNull();
    expect(safeInternalPath("/\\evil.com")).toBeNull();
  });
});
