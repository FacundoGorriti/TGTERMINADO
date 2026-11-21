import { z } from "zod";
import { phoneDigits, safeHttpsUrl, safeTrustedUrl } from "@/lib/security/urls";

/**
 * Esquema de un archivo de negocio (`src/data/businesses/<slug>.json`).
 * `.strict()` rechaza claves desconocidas para detectar errores de tipeo.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const BUSINESS_STATUSES = ["draft", "published", "archived"] as const;
export const WEEK_DAYS = ["mo", "tu", "we", "th", "fr", "sa", "su"] as const;

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "No puede estar vacío")
    .max(max, `Máximo ${max} caracteres`)
    .refine((v) => !/[<>]/.test(v), "No se admite HTML ni los caracteres < >");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usar formato AAAA-MM-DD")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v);
  }, "Fecha inexistente");

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usar formato HH:MM (24 h)");

/** Imagen local dentro de /public/images. Se verifica su existencia en validate.ts. */
export const imagePath = z
  .string()
  .regex(
    /^\/images\/[a-z0-9][a-z0-9/_-]*\.(webp|avif|png|jpe?g|svg)$/i,
    "Ruta de imagen inválida: debe ser /images/... con extensión webp, avif, png, jpg o svg",
  )
  .refine((v) => !v.includes("..") && !v.includes("//"), "Ruta de imagen no permitida");

const httpsUrl = z.string().refine((v) => safeHttpsUrl(v) !== null, "URL inválida: solo se admite https://");

const phone = z.string().refine((v) => phoneDigits(v) !== null, "Teléfono inválido");

const whatsapp = z
  .string()
  .regex(/^\d{10,15}$/, "WhatsApp: solo dígitos en formato internacional (ej. 5493873000000)");

export const openingHoursSchema = z
  .object({
    days: z.array(z.enum(WEEK_DAYS)).min(1).max(7),
    opens: time,
    closes: time,
  })
  .strict();

const attributeValue = z.union([safeText(300), z.array(safeText(80)).min(1).max(30)]);

export const businessSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]{2,63}$/, "id: minúsculas, números y guiones (3-64)"),
    slug: z.string().min(3).max(80).regex(SLUG_PATTERN, "slug: minúsculas, números y guiones"),
    name: safeText(90),
    categoryId: z.string().regex(SLUG_PATTERN),
    subcategoryId: z.string().regex(SLUG_PATTERN),
    shortDescription: safeText(160),
    description: safeText(2000),
    logo: imagePath.optional(),
    coverImage: imagePath.optional(),
    gallery: z
      .array(z.object({ src: imagePath, alt: safeText(160) }).strict())
      .max(12)
      .default([]),
    city: safeText(60),
    province: safeText(60),
    address: safeText(160).optional(),
    publicPhone: phone.optional(),
    whatsapp: whatsapp.optional(),
    websiteUrl: httpsUrl.optional(),
    instagramUrl: z
      .string()
      .refine((v) => safeTrustedUrl(v, "instagram") !== null, "Instagram: debe ser https://instagram.com/...")
      .optional(),
    facebookUrl: z
      .string()
      .refine((v) => safeTrustedUrl(v, "facebook") !== null, "Facebook: debe ser https://facebook.com/...")
      .optional(),
    mapsUrl: z
      .string()
      .refine((v) => safeTrustedUrl(v, "maps") !== null, "Mapa: debe ser un enlace https de Google Maps")
      .optional(),
    openingHours: z.array(openingHoursSchema).max(21).default([]),
    openingHoursNote: safeText(200).optional(),
    features: z.array(safeText(60)).max(20).default([]),
    keywords: z.array(safeText(40)).max(20).default([]),
    /** Campos contextuales del rubro. Claves permitidas según categories.ts. */
    attributes: z.record(z.string().regex(/^[a-z][a-zA-Z0-9]{1,40}$/), attributeValue).default({}),
    featured: z.boolean().default(false),
    publishedAt: isoDate,
    updatedAt: isoDate,
    status: z.enum(BUSINESS_STATUSES, { message: "Estado no reconocido (draft | published | archived)" }),
    /** true = registro ficticio de demostración. Se marca visualmente y no se indexa. */
    demo: z.boolean().default(false),
  })
  .strict();

export type BusinessInput = z.input<typeof businessSchema>;
export type Business = z.output<typeof businessSchema>;
export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];
export type WeekDay = (typeof WEEK_DAYS)[number];
export type OpeningHours = z.output<typeof openingHoursSchema>;
