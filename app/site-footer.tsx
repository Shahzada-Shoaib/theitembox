import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer id="site-footer" className="site-footer">
      <div className="footer-bottom">
        <a href="#top" aria-label="The Item Box — back to top"><Brand /></a>
        <span>Vice City Drop / 2026</span>
      </div>
    </footer>
  );
}
