import { expect, isMobile, test } from "./fixtures";

test.describe("búsqueda y filtros", () => {
  test("el buscador del inicio lleva a Explorar con la consulta", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("searchbox", { name: "Buscar en el directorio" });
    await input.fill("lomito");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/explorar\/\?q=lomito/);
    await expect(page.getByTestId("results-count")).toContainText("1 negocio encontrado");
  });

  test("búsqueda instantánea con acentos, URL sincronizada y botón limpiar", async ({ page }) => {
    await page.goto("/explorar/");
    const input = page.getByRole("searchbox");
    await input.fill("SANDWICHERÍA");
    await expect(page.getByTestId("results-count")).toContainText("negocio");
    await expect(page.getByTestId("business-card").first()).toContainText("Sandwichería Abi");
    await expect(page).toHaveURL(/q=SANDWICHER/);

    await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await expect(page).not.toHaveURL(/q=/);
  });

  test("busca por lo que vende cada negocio", async ({ page }) => {
    await page.goto("/explorar/?q=hamburguesa%20triple");
    await expect(page.getByTestId("business-card").first()).toContainText("Tanito");
  });

  test("estado sin resultados y recuperación", async ({ page }) => {
    await page.goto("/explorar/?q=zzzzqqq");
    await expect(page.getByText("No encontramos negocios con esos criterios")).toBeVisible();
    await page.getByRole("button", { name: "Limpiar búsqueda y filtros" }).click();
    await expect(page.getByTestId("business-card").first()).toBeVisible();
  });

  test("filtros combinados desde la URL compartida", async ({ page }) => {
    await page.goto("/explorar/?cat=gastronomia&sub=sandwicherias&sort=az");
    const cards = page.getByTestId("business-card");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("Sandwichería Abi");
  });

  test("filtro por rubro con chips", async ({ page }) => {
    await page.goto("/explorar/");
    const scope = isMobile(page) ? page.getByRole("group", { name: "Filtrar por rubro" }) : page.getByRole("complementary", { name: "Filtros" });
    await scope.getByRole("button", { name: "Hotelería y turismo" }).click();
    await expect(page.getByTestId("business-card")).toHaveCount(0);
    await expect(page).toHaveURL(/cat=hoteleria-y-turismo/);
    await scope.getByRole("button", { name: "Gastronomía" }).click();
    await expect(page.getByTestId("business-card")).toHaveCount(3);
  });

  test("filtros móviles en panel inferior accesible", async ({ page }) => {
    test.skip(!isMobile(page), "solo móvil");
    await page.goto("/explorar/");
    await page.getByRole("button", { name: /^Filtros/ }).click();
    const dialog = page.getByRole("dialog", { name: "Filtros" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Gastronomía" }).click();
    await dialog.getByRole("button", { name: /Ver \d+ resultados?/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/cat=gastronomia/);
  });

  test("valores manipulados en la URL se ignoran", async ({ page, consoleErrors }) => {
    await page.goto("/explorar/?cat=%3Cscript%3E&sub=x&sort=evil");
    await expect(page.getByTestId("business-card").first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
