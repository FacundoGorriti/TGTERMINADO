/*
 * TARTAGAL GO — inicialización del tema antes del primer pintado (evita parpadeo).
 * Archivo externo (no inline) para cumplir la Content-Security-Policy sin 'unsafe-inline'.
 */
(function () {
  var theme = "system";
  try {
    var stored = window.localStorage.getItem("tgo:theme");
    if (stored === "light" || stored === "dark" || stored === "system") theme = stored;
  } catch (_error) {
    /* almacenamiento bloqueado: se usa el tema del sistema */
  }
  var dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var root = document.documentElement;
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.setAttribute("data-theme-pref", theme);
  root.style.colorScheme = dark ? "dark" : "light";
})();
