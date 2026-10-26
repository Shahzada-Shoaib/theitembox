import { Brand, Icon } from "./brand";

const notes = [
  ["Five originals", "One complete drop"],
  ["Relaxed fits", "Made for daily play"],
  ["Sizes S–XL", "Find your player fit"],
  ["The Item Box", "Outside the ordinary"],
] as const;

export function SiteFooter() {
  return (
    <footer id="site-footer" className="site-footer">
      <div className="footer-notes">
        {notes.map(([title, copy]) => (
          <div key={title}><Icon name="check" /><span><strong>{title}</strong><small>{copy}</small></span></div>
        ))}
      </div>
      <div className="footer-bottom">
        <a href="#top" aria-label="The Item Box — back to top"><Brand /></a>
        <span>Vice City Drop / 2026</span>
      </div>
    </footer>
  );
}
