import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Imagen local con relación de aspecto fija (evita CLS) y carga diferida por defecto.
 * Solo admite rutas locales validadas por el catálogo (/images/...).
 */
export function ResponsiveImage({
  src,
  alt,
  ratio = "16/9",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  ratio?: "16/9" | "4/3" | "1/1" | "21/9";
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
}) {
  const ratioClass = { "16/9": "aspect-video", "4/3": "aspect-[4/3]", "1/1": "aspect-square", "21/9": "aspect-[21/9]" }[ratio];
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", ratioClass, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
      />
    </div>
  );
}
