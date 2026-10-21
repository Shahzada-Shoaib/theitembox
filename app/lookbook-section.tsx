import Image from "next/image";
import { Icon } from "./brand";
import type { Product } from "./products";

type LookbookSectionProps = {
  primary: Product;
  secondary: Product;
  tertiary: Product;
  onOpenProduct: (product: Product) => void;
};

const looks = [
  {
    image: "/lookbook/player-fit-pc-gamers.png",
    alt: "Model styling the black PC Gamers Tee in a concrete night setting",
  },
  {
    image: "/lookbook/player-fit-girl-gamer.png",
    alt: "Model styling the dusty-pink Girl Gamer Hoodie in a gaming lounge",
  },
  {
    image: "/lookbook/player-fit-free-fire.png",
    alt: "Model styling the red, white, and black Free Fire Hoodie in a moody stairwell",
  },
] as const;

export function LookbookSection({ primary, secondary, tertiary, onOpenProduct }: LookbookSectionProps) {
  const entries = [
    { ...looks[0], product: primary },
    { ...looks[1], product: secondary },
    { ...looks[2], product: tertiary },
  ];

  return (
    <section className="lookbook-section" aria-labelledby="lookbook-title">
      <header className="lookbook-header">
        <h2 id="lookbook-title">WORN BY<br /><em>PLAYERS.</em></h2>
      </header>

      <div className="lookbook-grid" aria-label="Player fit lookbook">
        {entries.map((entry, index) => (
          <article className={`lookbook-card ${index === 0 ? "is-primary" : "is-secondary"}`} key={entry.product.id}>
            <button type="button" className="lookbook-frame" onClick={() => onOpenProduct(entry.product)} aria-label={`View ${entry.product.name}`}>
              <Image
                src={entry.image}
                alt={entry.alt}
                fill
                sizes={index === 0 ? "(max-width: 600px) 84vw, 58vw" : "(max-width: 600px) 84vw, 34vw"}
                className="object-cover"
              />
              <span className="lookbook-action" aria-hidden="true"><Icon name="arrow" /></span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
