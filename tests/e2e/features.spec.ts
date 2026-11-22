import AxeBuilder from "@axe-core/playwright";
import { expect, expectNoHorizontalOverflow, test } from "./fixtures";

test.describe("favoritos", () => {
  test("guardar, listar, persistir y quitar", async ({ page }) => {
    await page.goto("/explorar/");
    await page.getByRole("button", { name: /Guardar Sandwichería Abi en favoritos/ }).click();
    await expect(page.getByRole("button", { name: /Quitar Sandwichería Abi de favoritos/ })).toHaveAttribute("aria-pressed", "true");

    await page.goto("/favoritos/");
    await expect(page.getByTestId("favorites-count")).toContainText("1 negocio guardado");
    await page.reload();
    await expect(page.getByTestId("business-card")).toHaveCount(1);

    await page.getByRole("button", { name: /Quitar Sandwichería Abi de favoritos/ }).click();
    await expect(page.getByText("Todavía no guardaste negocios")).toBeVisible();
  });

  test("datos locales corruptos no rompen la página", async ({ page, consoleErrors }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("tgo:favorites:v1", '{"slugs":["<img src=x onerror=alert(1)>", 7, "no-existe-mas"]');
      window.localStorage.setItem("tgo:theme", "<script>");
    });
    await page.goto("/favoritos/");
    await expect(page.getByText("Todavía no guardaste negocios")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("tema", () => {
  test("cambia, persiste y se aplica antes de hidratar", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");

    const toggle = page.getByTestId("theme-toggle");
    await toggle.click(); // system → light (pref)
    await toggle.click(); // light → dark
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Al recargar, el tema se aplica desde el script bloqueante (sin parpadeo).
    await page.reload();
    const themeAtFirstParse = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(themeAtFirstParse).toBe("dark");
  });

  test("respeta el tema del sistema en modo automático", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme-pref", "system");
  });
});

test.describe("tarjeta de negocio", () => {
  test("la tarjeta abre la web propia del negocio en la misma pestaña", async ({ page }) => {
    await page.route("https://sandwicheriaaby2000.vercel.app/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<title>Abi</title>" }),
    );
    await page.goto("/explorar/");
    const link = page.getByTestId("business-card").filter({ hasText: "Sandwichería Abi" }).getByTestId("business-link");
    await expect(link).toHaveAttribute("href", "https://sandwicheriaaby2000.vercel.app/");
    expect(await link.getAttribute("target")).toBeNull();
    await link.click();
    await expect(page).toHaveURL("https://sandwicheriaaby2000.vercel.app/");
    expect(page.context().pages()).toHaveLength(1);
  });

  test("la tarjeta de Tanito abre su web", async ({ page }) => {
    await page.goto("/explorar/");
    const link = page.getByTestId("business-card").filter({ hasText: "Tanito" }).getByTestId("business-link");
    await expect(link).toHaveAttribute("href", "https://tanito26.vercel.app/");
  });

  test("ya no existen fichas internas de negocio", async ({ page }) => {
    const res = await page.goto("/negocios/sandwicheria-abi/");
    expect(res?.status()).toBe(404);
  });

  test("todos los enlaces externos usan rel noopener noreferrer", async ({ page }) => {
    for (const path of ["/", "/explorar/"]) {
      await page.goto(path);
      const unsafe = await page.$$eval('a[target="_blank"]', (links) =>
        links.filter((a) => !(a.getAttribute("rel") ?? "").includes("noopener")).map((a) => a.getAttribute("href")),
      );
      expect(unsafe).toEqual([]);
      const badSchemes = await page.$$eval("a[href]", (links) =>
        links.map((a) => a.getAttribute("href") ?? "").filter((h) => /^(javascript|data|vbscript):/i.test(h.trim())),
      );
      expect(badSchemes).toEqual([]);
    }
  });
});

test.describe("seguridad", () => {
  test("CSP por hashes presente y sin violaciones", async ({ page, consoleErrors }) => {
    const res = await page.goto("/explorar/");
    const headers = res?.headers() ?? {};
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");

    const meta = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
    expect(meta).toMatch(/script-src 'self' 'sha256-/);
    expect(meta).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/);

    await page.getByRole("searchbox").fill("pizza");
    await expect(page.getByTestId("business-card")).toHaveCount(1);
    expect(consoleErrors.filter((e) => /Content Security Policy|Refused to/i.test(e))).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("la navegación del cliente funciona bajo la CSP", async ({ page, consoleErrors }) => {
    await page.goto("/categorias/");
    await page.getByRole("link", { name: /Gastronomía/ }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Gastronomía" })).toBeVisible();
    await expect(page.getByTestId("business-card").first()).toContainText("Sandwichería Abi");
    await page.getByRole("link", { name: "Explorar" }).first().click();
    await expect(page).toHaveURL(/\/explorar\//);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("accesibilidad básica (axe, WCAG 2.x A/AA)", () => {
  for (const path of ["/", "/explorar/", "/categorias/", "/categorias/salud-y-bienestar/", "/categorias/gastronomia/", "/favoritos/", "/sumar-negocio/", "/privacidad/"]) {
    for (const scheme of ["light", "dark"] as const) {
      test(`${path} (${scheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const serious = results.violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
        expect(serious).toEqual([]);
      });
    }
  }
});

test.describe("diseño responsive", () => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    test(`sin desplazamiento horizontal a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/explorar/", "/categorias/gastronomia/", "/categorias/"]) {
        await page.goto(path);
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("áreas táctiles de la navegación inferior ≥ 44px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const boxes = await page.getByRole("navigation", { name: "Navegación inferior" }).getByRole("link").evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect()).map((r) => ({ w: r.width, h: r.height })),
    );
    expect(boxes).toHaveLength(4);
    for (const b of boxes) {
      expect(b.w).toBeGreaterThanOrEqual(44);
      expect(b.h).toBeGreaterThanOrEqual(44);
    }
  });
});
