import { Link } from "@tanstack/react-router";

type Page = "home" | "who-we-are" | "what-we-do";

/**
 * Shared site header: the Who We Are header, used verbatim on every page.
 * `contactHref` is the in-page anchor of the page's contact / call-to-action section.
 */
export function SiteHeader({ current, contactHref }: { current: Page; contactHref: string }) {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10">
      <Link to="/" className="site-header-logo text-xl" aria-label="LeadZLoco home">
        LeadZ<span className="site-header-gold">Loco</span>
      </Link>
      <nav className="site-header-nav hidden gap-8 md:flex" aria-label="Main">
        <Link to="/who-we-are" aria-current={current === "who-we-are" ? "page" : undefined}>
          Who we are
        </Link>
        <Link to="/what-we-do" aria-current={current === "what-we-do" ? "page" : undefined}>
          What we do
        </Link>
        <a href={contactHref}>Contact</a>
      </nav>
    </header>
  );
}
