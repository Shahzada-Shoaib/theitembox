import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="flex items-center justify-center border-t border-white/10 px-[6%] py-6 [&_.brand]:w-[92px] max-[600px]:py-5 max-[600px]:[&_.brand]:w-[76px]">
      <a href="#top" className="inline-flex" aria-label="The Item Box — back to top">
        <Brand compact />
      </a>
    </footer>
  );
}
