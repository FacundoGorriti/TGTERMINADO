import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "out/**", "node_modules/**", "playwright-report/**", "test-results/**", "next-env.d.ts"],
  },
  {
    files: ["public/**/*.js"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
  {
    rules: {
      // Seguridad: prohibir patrones de ejecución dinámica de código.
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "react/no-danger": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[property.name='innerHTML']",
          message: "No usar innerHTML: renderizar datos como texto.",
        },
        {
          selector: "MemberExpression[property.name='outerHTML']",
          message: "No usar outerHTML.",
        },
      ],
    },
  },
  {
    files: ["src/components/seo/json-ld.tsx"],
    rules: {
      // Única excepción documentada (docs/SECURITY.md): JSON-LD serializado y escapado.
      "react/no-danger": "off",
    },
  },
];

export default config;
