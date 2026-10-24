import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-center border-t border-white/10 px-[6.5%] py-9 [&_.brand]:w-[96px] max-[600px]:px-[6%] max-[600px]:py-7 max-[600px]:[&_.brand]:w-[78px]">
      <a href="#top" className="inline-flex" aria-label="The Item Box — back to top">
        <Brand compact />
      </a>
    </footer>
  );
}
