/**
 * Resumen serializable de un negocio, enviado a componentes de cliente.
 * Contiene solo información pública ya validada.
 */
export interface BusinessSummary {
  slug: string;
  name: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  city: string;
  logo: string | null;
  coverImage: string | null;
  /** Web propia del negocio (https), destino de la tarjeta. */
  websiteUrl: string;
  hasWebsite: boolean;
  hasWhatsapp: boolean;
  featured: boolean;
  demo: boolean;
  publishedAt: string;
  searchText: {
    description: string;
    features: string[];
    keywords: string[];
  };
}
