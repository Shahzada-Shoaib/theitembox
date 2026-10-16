import Image from "next/image";
import type { Product } from "./products";

type ProductImageProps = {
  product: Product;
  priority?: boolean;
  sizes?: string;
  className?: string;
  unoptimized?: boolean;
};

export function ProductImage({ product, priority = false, sizes = "(max-width: 600px) 50vw, 350px", className = "", unoptimized = true }: ProductImageProps) {
  return (
    <Image
      src={product.image}
      alt={product.subtitle}
      fill
      unoptimized={unoptimized}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "eager"}
      className={`object-contain ${className}`}
    />
  );
}
