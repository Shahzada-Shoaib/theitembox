import { Brand, Icon } from "./brand";

export function AboutSection() {
  return (
    <section className="grid grid-cols-[1fr_1.15fr] gap-[10%] border-b border-white/10 px-[10%] py-[100px] max-[900px]:grid-cols-[.8fr_1.2fr] max-[900px]:gap-[8%] max-[900px]:px-[7%] max-[900px]:py-[70px] max-[600px]:grid-cols-1 max-[600px]:gap-12 max-[600px]:px-[8%] max-[600px]:py-[53px]" id="about">
      <div className="flex flex-col items-center justify-center gap-5 [&_.brand]:w-[250px] [&_.brand]:-rotate-[7deg] max-[900px]:[&_.brand]:w-[180px] max-[600px]:[&_.brand]:w-[154px]">
        <Brand compact />
        <span className="mt-2.5 text-[8px] tracking-[2px] text-[#777b6d] max-[600px]:mt-0 max-[600px]:text-[7px] max-[600px]:tracking-[1.5px]">EST. FOR THE EVERYDAY.</span>
      </div>
      <div>
        <span className="flex items-center gap-[11px] text-[8px] font-medium tracking-[2.3px] text-[#b7ff00] max-[600px]:text-[7px] max-[600px]:tracking-[1.7px]">NOT JUST THINGS. YOUR THINGS.</span>
        <h2 className="my-[22px] text-[clamp(27px,3vw,44px)] font-semibold leading-[1.12] tracking-[-1.8px] max-[600px]:my-[19px] max-[600px]:text-[clamp(31px,10vw,36px)]">A little less ordinary.<br />A little more <em className="font-serif font-normal text-[#b7ff00]">you.</em></h2>
        <p className="max-w-[410px] text-xs leading-[1.9] text-[#8e9286] max-[600px]:text-[13px] max-[600px]:leading-[1.75]">We&apos;re The Item Box. A home for everyday pieces with a point of view. The things you wear, the things you carry, the things that become part of your story. Thoughtfully brought together. Ready to make your own.</p>
        <a href="#collection" className="mt-[13px] inline-flex items-center gap-[30px] border-b border-[#575e45] py-3 text-[11px] hover:text-[#b7ff00]">Find your thing <Icon name="arrow" /></a>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-between px-[6.5%] py-[34px] [&_.brand]:w-[77px] [&_.brand>span]:text-[6px] [&_.brand>span]:tracking-[2.4px] max-[600px]:px-[6%] max-[600px]:py-[26px] max-[600px]:[&_.brand]:w-[59px] max-[600px]:[&_.brand>span]:text-[4.5px] max-[600px]:[&_.brand>span]:tracking-[1.9px]">
      <a href="#top" aria-label="Back to top"><Brand /></a>
      <span className="text-[8px] tracking-[1px] text-[#777c6d] max-[600px]:text-[7px] max-[600px]:tracking-[.2px]">© {new Date().getFullYear()} THE ITEM BOX</span>
      <a href="#top" className="flex min-h-11 items-center gap-[18px] text-[8px] tracking-[1px] max-[600px]:gap-[7px] max-[600px]:text-[7px] [&>svg]:w-[13px] [&>svg]:-rotate-90 max-[600px]:[&>svg]:w-[11px]">BACK TO TOP <Icon name="arrow" /></a>
    </footer>
  );
}
