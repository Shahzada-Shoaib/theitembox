export const products = [
  { id: "sound", name: "PC Gamers Tee", category: "Apparel", subtitle: "Black PC gamers graphic T-shirt", price: 2990, image: "/Tees-images/image1.png", color: "Midnight black", tag: "PLAYER ONE", description: "A relaxed black graphic tee for the setup, the street, and every session in between. Soft everyday fabric with a clean PC gamers print." },
  { id: "frames", name: "Gamers Don’t Die Tee", category: "Apparel", subtitle: "Red arcade graphic T-shirt", price: 2990, image: "/Tees-images/image2.png", color: "Arcade red", tag: "EXTRA LIFE", description: "A bold red tee with a retro arcade graphic and an easy everyday fit. Built for anyone who always has one more life left." },
  { id: "tee", name: "Left It All Behind Tee", category: "Apparel", subtitle: "Black cinematic graphic T-shirt", price: 3290, image: "/Tees-images/image3.png", color: "Washed black", tag: "THE STORY EDIT", description: "An oversized black graphic tee with a cinematic front print. A statement layer with a relaxed silhouette and soft hand feel." },
  { id: "watch", name: "Free Fire Hoodie", category: "Apparel", subtitle: "Red, white and black gaming hoodie", price: 4490, image: "/Tees-images/image4.png", color: "Red / white / black", tag: "DROP ZONE", description: "A colour-block gaming hoodie with a roomy hood, kangaroo pocket, and a warm everyday fit made for cooler sessions." },
  { id: "squid", name: "Squid Game Hoodie", category: "Apparel", subtitle: "Black Squid Game graphic hoodie", price: 4490, image: "/Tees-images/image5.png", color: "Black / white", tag: "GAME ON", description: "A black pullover hoodie with a crisp Squid Game graphic, contrast sleeve stripes, and a comfortable relaxed fit." },
  { id: "girl-gamer", name: "Girl Gamer Hoodie", category: "Apparel", subtitle: "Pink gamer graphic hoodie", price: 4490, image: "/Tees-images/image6.png", color: "Dusty pink", tag: "PLAY YOUR WAY", description: "A dusty-pink pullover hoodie with a colourful gamer graphic, soft finish, and an easy fit for everyday play." },
] as const;

export type Product = (typeof products)[number];
export type BagItem = { id: Product["id"]; size: string; quantity: number };
export const formatPrice = (price: number) => `Rs. ${price.toLocaleString("en-PK")}`;
