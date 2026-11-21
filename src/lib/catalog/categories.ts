import { categories } from "@/data/categories";
import type { Category, ProfileField, Subcategory } from "@/types/category";

const categoryById = new Map(categories.map((c) => [c.id, c]));
const subcategoryIndex = new Map<string, { category: Category; subcategory: Subcategory }>();
for (const category of categories) {
  for (const subcategory of category.subcategories) {
    subcategoryIndex.set(subcategory.id, { category, subcategory });
  }
}

export function getCategories(): readonly Category[] {
  return categories;
}

export function getCategory(id: string): Category | undefined {
  return categoryById.get(id);
}

export function getSubcategory(id: string): { category: Category; subcategory: Subcategory } | undefined {
  return subcategoryIndex.get(id);
}

/** Campos contextuales efectivos para un par categoría/subcategoría. */
export function getProfileFields(categoryId: string, subcategoryId: string): ProfileField[] {
  const category = categoryById.get(categoryId);
  if (!category) return [];
  const sub = category.subcategories.find((s) => s.id === subcategoryId);
  return [...category.profileFields, ...(sub?.extraFields ?? [])];
}

export function getSchemaType(categoryId: string, subcategoryId: string): string {
  const category = categoryById.get(categoryId);
  const sub = category?.subcategories.find((s) => s.id === subcategoryId);
  return sub?.schemaType ?? category?.schemaType ?? "LocalBusiness";
}

/** Problemas estructurales del propio registro de categorías. */
export function validateCategoryRegistry(list: readonly Category[] = categories): string[] {
  const errors: string[] = [];
  const catIds = new Set<string>();
  const subIds = new Set<string>();
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const fieldKey = /^[a-z][a-zA-Z0-9]{1,40}$/;

  for (const c of list) {
    if (!slug.test(c.id)) errors.push(`Categoría "${c.id}": id inválido`);
    if (catIds.has(c.id)) errors.push(`Categoría duplicada: "${c.id}"`);
    catIds.add(c.id);
    if (!c.name.trim() || !c.description.trim()) errors.push(`Categoría "${c.id}": nombre o descripción vacíos`);
    if (c.subcategories.length === 0) errors.push(`Categoría "${c.id}": sin subcategorías`);

    const fieldKeys = new Set<string>();
    for (const field of c.profileFields) {
      if (!fieldKey.test(field.key)) errors.push(`Campo "${field.key}" de "${c.id}": clave inválida`);
      if (fieldKeys.has(field.key)) errors.push(`Campo duplicado "${field.key}" en "${c.id}"`);
      fieldKeys.add(field.key);
    }

    for (const sub of c.subcategories) {
      if (!slug.test(sub.id)) errors.push(`Subcategoría "${sub.id}": id inválido`);
      if (subIds.has(sub.id)) errors.push(`Subcategoría duplicada: "${sub.id}"`);
      subIds.add(sub.id);
      for (const field of sub.extraFields ?? []) {
        if (!fieldKey.test(field.key)) errors.push(`Campo "${field.key}" de "${sub.id}": clave inválida`);
        if (fieldKeys.has(field.key)) errors.push(`Campo "${field.key}" de "${sub.id}" repite uno de la categoría`);
      }
    }
  }
  return errors;
}
