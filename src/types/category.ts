/** Tipos del registro centralizado de rubros. */

export type CategoryIconName =
  | "health"
  | "food"
  | "shopping"
  | "home"
  | "travel"
  | "car"
  | "briefcase"
  | "beauty"
  | "sports"
  | "education"
  | "sparkles"
  | "services";

export type ProfileFieldType = "text" | "list" | "url";

/**
 * Campo contextual de una ficha. Cada rubro declara qué campos admite; las fichas
 * los muestran automáticamente sin escribir componentes nuevos.
 */
export interface ProfileField {
  /** Clave dentro de `attributes` del negocio. Solo letras (camelCase). */
  key: string;
  /** Etiqueta visible. */
  label: string;
  type: ProfileFieldType;
  /** Para campos `url`: texto del botón (ej. "Ver menú"). */
  actionLabel?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  /** Subtipo Schema.org (LocalBusiness). Si no se indica, se hereda de la categoría. */
  schemaType?: string;
  /** Campos adicionales específicos de la subcategoría. */
  extraFields?: ProfileField[];
}

export interface Category {
  id: string;
  name: string;
  /** Descripción breve (tarjetas y metadata). */
  description: string;
  icon: CategoryIconName;
  schemaType: string;
  profileFields: ProfileField[];
  subcategories: Subcategory[];
}
