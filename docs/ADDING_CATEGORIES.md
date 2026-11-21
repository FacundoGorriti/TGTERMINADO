# Cómo agregar rubros y subrubros

Todos los rubros viven en **un solo archivo**: `src/data/categories.ts`.
Al editarlo se actualizan solas las páginas `/categorias/`, `/categorias/<id>/`, los filtros, el buscador, el pie de página y el sitemap.

## Agregar un subrubro

Dentro de la categoría correspondiente, agregar un elemento a `subcategories`:

```ts
{ id: "vinotecas", name: "Vinotecas", schemaType: "LiquorStore" },
```

- `id`: minúsculas, números y guiones. **Único en todo el archivo** (no solo en la categoría).
- `name`: nombre visible.
- `schemaType` (opcional): subtipo de [Schema.org LocalBusiness](https://schema.org/LocalBusiness) para SEO. Si se omite se usa el de la categoría.
- `extraFields` (opcional): campos contextuales adicionales solo para este subrubro.

## Agregar una categoría

```ts
{
  id: "mascotas",                       // será la URL: /categorias/mascotas/
  name: "Mascotas",
  description: "Pet shops, peluquerías caninas y adiestramiento.",
  icon: "sparkles",                     // ver íconos disponibles abajo
  schemaType: "PetStore",
  profileFields: [f.services, f.productTypes],
  subcategories: [
    { id: "pet-shops", name: "Pet shops", schemaType: "PetStore" },
    { id: "peluquerias-caninas", name: "Peluquerías caninas" },
  ],
},
```

### Íconos

Los íconos disponibles se listan en `CategoryIconName` (`src/types/category.ts`) y se asignan en
`src/components/categories/category-icon.tsx`. Para un ícono nuevo:

1. Agregar el nombre al tipo `CategoryIconName`.
2. Importar el ícono de `lucide-react` y agregarlo al mapa `ICONS`.

## Campos contextuales

Los campos que se muestran en “Información del rubro” se definen en el objeto `f` al inicio de `categories.ts`:

```ts
petTypes: { key: "petTypes", label: "Animales que atiende", type: "list" },
```

Tipos: `text` (texto corto), `list` (lista de etiquetas) y `url` (botón a un sitio externo; requiere `actionLabel`).
Luego se agregan a `profileFields` de la categoría o a `extraFields` de un subrubro. Ningún componente debe modificarse.

## Verificación

```bash
npm run catalog:validate   # detecta ids duplicados o inválidos y campos repetidos
npm run test               # incluye pruebas del registro
```

## Precauciones

- **No cambiar el `id`** de un rubro o subrubro que ya tiene negocios: los archivos que lo usan dejarían de validar
  (el build lo detecta) y las URLs compartidas dejarían de funcionar.
- Para renombrar, cambiar solo `name`.
