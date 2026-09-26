export const products = [
  { id: "sound", name: "The Sound Edit", category: "Tech", subtitle: "Over-ear wireless headphones", price: 8490, image: "/images/headphones.jpg", color: "Midnight black", tag: "THE DAILY ESSENTIAL", description: "Your soundtrack. Your space. A clean, understated pair for the commute, the creative hours, and everything in between." },
  { id: "frames", name: "Off Duty Frames", category: "Accessories", subtitle: "Round metal-frame sunglasses", price: 2490, image: "/images/eyewear.jpg", color: "Gold / smoke", tag: "MAIN CHARACTER ENERGY", description: "A little perspective goes a long way. A timeless round silhouette with a lightweight metal frame, made to finish your everyday rotation." },
  { id: "tee", name: "The Everyday Tee", category: "Apparel", subtitle: "Relaxed essential T-shirt", price: 2990, image: "/images/tee.jpg", color: "Cloud white", tag: "LESS, BUT BETTER", description: "The one you reach for on repeat. An easy white essential with a relaxed silhouette that works with just about everything." },
  { id: "watch", name: "Time Well Spent", category: "Accessories", subtitle: "Minimal everyday timepiece", price: 5490, image: "/images/watch.jpg", color: "White / silver", tag: "MAKE EVERY MOMENT YOURS", description: "A quiet statement for your wrist. A clean dial, considered details, and a silhouette that feels just as good dressed up as it does off duty." },
] as const;

export type Product = (typeof products)[number];
export type BagItem = { id: Product["id"]; size: string; quantity: number };
export const formatPrice = (price: number) => `Rs. ${price.toLocaleString("en-PK")}`;
