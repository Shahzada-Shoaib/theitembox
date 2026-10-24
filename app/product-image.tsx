import Image from "next/image";
import type { CSSProperties } from "react";
import type { Product } from "./products";

type ProductImageProps = {
  product: Product;
  image?: string;
  alt?: string;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  unoptimized?: boolean;
  fit?: "contain" | "cover";
};

export function ProductImage({ product, image, alt, sizes = "(max-width: 600px) 50vw, 350px", className = "", style, unoptimized = false, fit = "contain" }: ProductImageProps) {
  return (
    <Image
      src={image ?? product.image}
      alt={alt ?? product.subtitle}
      fill
      unoptimized={unoptimized}
      sizes={sizes}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
      style={style}
    />
  );
}
