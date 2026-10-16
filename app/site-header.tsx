import type { RefObject } from "react";
import { Brand, Icon } from "./brand";
import { IconButton } from "./ui";

type SiteHeaderProps = {
  bagCount: number;
  bagButtonRef: RefObject<HTMLButtonElement | null>;
  productCount: number;
  onOpenBag: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
};

export function SiteHeader({ bagCount, bagButtonRef, productCount, onOpenBag, onOpenMenu, onOpenSearch }: SiteHeaderProps) {
  return (
    <header className="absolute inset-x-[4.1%] top-0 z-20 flex h-[105px] items-center justify-between border-b border-white/15 max-[900px]:inset-x-[5%] max-[900px]:h-[90px] max-[600px]:inset-x-[6%] max-[600px]:h-20">
      <a href="#top" className="inline-flex" aria-label="The Item Box home"><Brand /></a>
      <nav className="ml-[65px] flex items-center gap-[37px] max-[1100px]:ml-0 max-[1100px]:gap-6 max-[900px]:gap-[18px] max-[600px]:hidden" aria-label="Main navigation">
        <a className="inline-flex items-center gap-[9px] py-3.5 text-xs text-[#dddcd9] transition-colors hover:text-[#b7ff00] max-[900px]:text-[10px]" href="#collection">The collection <span className="self-start text-[9px] text-[#91938d]">{productCount.toString().padStart(2, "0")}</span></a>
        <a className="inline-flex items-center py-3.5 text-xs text-[#dddcd9] transition-colors hover:text-[#b7ff00] max-[900px]:text-[10px]" href="#about">Our world</a>
      </nav>
      <div className="flex items-center gap-5 max-[900px]:gap-3 max-[600px]:gap-[18px]">
        <IconButton label="Search the collection" icon="search" className="max-[600px]:hidden" onClick={onOpenSearch} />
        <span className="h-[19px] w-px bg-white/20 max-[600px]:hidden" />
        <button ref={bagButtonRef} type="button" className="flex items-center gap-[11px] text-xs max-[600px]:gap-[7px] max-[600px]:text-[11px]" onClick={onOpenBag} aria-label={`Open bag, ${bagCount} items`}>
          <span className="bag-flight-target grid size-[26px] shrink-0 place-items-center rounded-full [&>svg]:size-[19px]"><Icon name="bag" /></span>
          <span>Bag</span>
          <span className="grid size-[26px] place-items-center rounded-full border border-white/25 text-[10px] max-[600px]:size-[22px] max-[600px]:text-[9px]">{bagCount.toString().padStart(2, "0")}</span>
        </button>
        <span className="hidden max-[600px]:contents"><IconButton label="Open menu" icon="menu" onClick={onOpenMenu} /></span>
      </div>
    </header>
  );
}
