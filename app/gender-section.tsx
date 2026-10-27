import Image from "next/image";

const categories = [
  {
    label: "Men",
    image: "/campaign/men-cutout.png",
  },
  {
    label: "Women",
    image: "/campaign/women-cutout.png",
  },
] as const;

export function GenderSection() {
  return (
    <section className="gender-section" aria-label="Shop by category">
      {categories.map(category => (
        <a className="gender-panel" href="#collection" key={category.label} aria-label={`Shop ${category.label}`}>
          <Image
            src={category.image}
            alt={`${category.label} collection`}
            fill
            sizes="(max-width: 600px) 50vw, 50vw"
          />
          <span>{category.label}</span>
        </a>
      ))}
    </section>
  );
}
