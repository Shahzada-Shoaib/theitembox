import Image from "next/image";
import type { Product } from "./products";

type ProductImageProps = {
  product: Product;
  image?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  unoptimized?: boolean;
  fit?: "contain" | "cover";
};

export function ProductImage({ product, image, alt, priority = false, sizes = "(max-width: 600px) 50vw, 350px", className = "", unoptimized = true, fit = "contain" }: ProductImageProps) {
  return (
    <Image
      src={image ?? product.image}
      alt={alt ?? product.subtitle}
      fill
      unoptimized={unoptimized}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "eager"}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
    />
  );
}
