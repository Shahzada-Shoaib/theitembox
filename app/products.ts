export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Apparel";
  collection: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  gallery: readonly string[];
  color: string;
  fit: string;
  tag: string;
  sizes: readonly string[];
};

// This is the single source of truth for every product shown on the site.
// Keep `main.png` as the clean storefront image and add product photography to
// `gallery`. Section-specific arrays below only control ordering and visibility.
export const products = [
  {
    id: "l-1",
    slug: "rockstar-logo-pink-tee",
    name: "Rockstar Logo Pink Tee",
    category: "Apparel",
    collection: "Vice City Drop",
    subtitle: "Pink graphic T-shirt with a blue Rockstar logo",
    description: "A bright pink everyday tee finished with the classic Rockstar mark in blue. Cut in a relaxed silhouette for an easy streetwear fit.",
    price: 2990,
    image: "/Products/L-1/main.png",
    gallery: [
      "/Products/L-1/main.png",
      "/Products/L-1/IMG_6834.AVIF",
      "/Products/L-1/IMG_6840%20(1).AVIF",
      "/Products/L-1/transparent-image.png",
    ],
    color: "Rockstar pink",
    fit: "Relaxed",
    tag: "ROCKSTAR CLASSIC",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "l-2",
    slug: "greetings-from-vice-city-pink-tee",
    name: "Greetings From Vice City Tee",
    category: "Apparel",
    collection: "Vice City Drop",
    subtitle: "Pink Vice City postcard graphic T-shirt",
    description: "A postcard-inspired Vice City graphic on vivid pink cotton, bringing sun-soaked colour and playful game nostalgia to an easy daily tee.",
    price: 2990,
    image: "/Products/L-2/main.png",
    gallery: [
      "/Products/L-2/main.png",
      "/Products/L-2/IMG_6838.AVIF",
      "/Products/L-2/IMG_6840.AVIF",
    ],
    color: "Vice pink",
    fit: "Relaxed",
    tag: "POSTCARD EDIT",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "l-3",
    slug: "vice-city-mosaic-black-tee",
    name: "Vice City Mosaic Black Tee",
    category: "Apparel",
    collection: "Vice City Drop",
    subtitle: "Black T-shirt with a colourful Vice City mosaic graphic",
    description: "A black graphic tee featuring a stacked Vice City mosaic in sunset pink, blue and gold. A bold centre print with a clean streetwear silhouette.",
    price: 3290,
    image: "/Products/L-3/main.png",
    gallery: [
      "/Products/L-3/main.png",
      "/Products/L-3/IMG_6828.AVIF",
      "/Products/L-3/IMG_6829.AVIF",
      "/Products/L-3/IMG_6830.AVIF",
    ],
    color: "Midnight black",
    fit: "Relaxed",
    tag: "NEON NIGHTS",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "l-4",
    slug: "vice-city-dino-white-tee",
    name: "Vice City Dino White Tee",
    category: "Apparel",
    collection: "Vice City Drop",
    subtitle: "White T-shirt with a Vice City dinosaur graphic",
    description: "A crisp white tee led by the collection's sunglasses-wearing dinosaur artwork. Colourful, playful and easy to style year-round.",
    price: 3290,
    image: "/Products/L-4/main.png",
    gallery: [
      "/Products/L-4/main.png",
      "/Products/L-4/IMG_6824.AVIF",
      "/Products/L-4/IMG_6825.AVIF",
      "/Products/L-4/IMG_6826.AVIF",
    ],
    color: "Optic white",
    fit: "Relaxed",
    tag: "DINO EDIT",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "l-5",
    slug: "vice-city-leonida-black-tee",
    name: "Vice City Leonida Black Tee",
    category: "Apparel",
    collection: "Vice City Drop",
    subtitle: "Black Vice City Leonida graphic T-shirt",
    description: "The full Leonida story rendered as a vibrant front graphic on deep black. Designed as the statement piece of the Vice City drop.",
    price: 3290,
    image: "/Products/L-5/main.png",
    gallery: [
      "/Products/L-5/main.png",
      "/Products/L-5/IMG_6836.AVIF",
      "/Products/L-5/WhatsApp%20Image%202026-10-17%20at%204.33.01%20PM%20(2).jpeg",
      "/Products/L-5/WhatsApp%20Image%202026-10-17%20at%204.33.02%20PM%20(2).jpeg",
      "/Products/L-5/WhatsApp%20Image%202026-10-17%20at%204.33.02%20PM.jpeg",
    ],
    color: "Midnight black",
    fit: "Relaxed",
    tag: "LEONIDA STORY",
    sizes: ["S", "M", "L", "XL"],
  },
] as const satisfies readonly Product[];

const pickProducts = (ids: readonly Product["id"][]) =>
  ids.map(id => products.find(product => product.id === id)!).filter(Boolean);

export const heroProducts = pickProducts(["l-1", "l-2", "l-4", "l-3"]);
export const sliderProducts = pickProducts(["l-1", "l-2", "l-3", "l-4", "l-5"]);
export const reelProducts = pickProducts(["l-3", "l-1", "l-4", "l-2", "l-5"]);
export const lookbookProducts = pickProducts(["l-3", "l-1", "l-4"]);
export const collectionProducts = pickProducts(["l-2", "l-3", "l-4", "l-5"]);

export type BagItem = { id: Product["id"]; size: string; quantity: number };
export const formatPrice = (price: number) => `Rs. ${price.toLocaleString("en-PK")}`;
