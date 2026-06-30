import {
  useEffect,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCloudSun,
  faLock,
  faMoon,
  faTerminal,
} from "@fortawesome/free-solid-svg-icons";

import NavDropdown from "./NavDropdown";
import { primaryNav, type NavItem } from "./navData";

type SiteNavProps = {
  path?: string;
};

const isActivePath = (path: string, href?: string) =>
  href && href !== "#" && path === href;

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function DesktopNavItem({ item, path }: { item: NavItem; path: string }) {
  const active = isActivePath(path, item.href);
  const [open, setOpen] = useState(false);
  const dropdownId = item.dropdown
    ? `nav-dropdown-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : undefined;

  function closeOnBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      className="h-full"
      onMouseEnter={() => item.dropdown && setOpen(true)}
      onMouseLeave={() => item.dropdown && setOpen(false)}
      onFocus={() => item.dropdown && setOpen(true)}
      onBlur={closeOnBlur}
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <a
        href={item.href ?? "#"}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={cx(
          "flex h-full items-center px-3 text-sm font-semibold text-muted transition hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "text-fg",
        )}
        aria-current={active ? "page" : undefined}
        aria-haspopup={item.dropdown ? "true" : undefined}
        aria-expanded={item.dropdown ? open : undefined}
        aria-controls={dropdownId}
      >
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1">
          {item.label}
          {item.dropdown && (
            <FontAwesomeIcon
              icon={faChevronDown}
              className={cx(
                "text-xs transition duration-200",
                open && "rotate-180",
              )}
            />
          )}
        </span>
      </a>
      {item.dropdown && (
        <div
          id={dropdownId}
          className={cx(
            "fixed left-0 top-16 z-30 w-full transition duration-200",
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
        >
          <NavDropdown dropdown={item.dropdown} />
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const currentTheme =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("parle-theme", nextTheme);
    } catch {
      // Keep the in-page theme switch even when storage is unavailable.
    }
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-fg transition hover:border-accent-ui hover:bg-button-hover"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <FontAwesomeIcon icon={theme === "dark" ? faCloudSun : faMoon} />
    </button>
  );
}

function MobileMenu({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <div className="border-t border-border bg-nav-bg px-6 py-6 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="space-y-5">
        <a
          href="/install"
          className="flex items-center justify-center gap-2 rounded-md border border-border bg-button-bg px-4 py-3 text-sm font-semibold text-fg"
        >
          <FontAwesomeIcon icon={faTerminal} /> Install
        </a>
        {items.map((item) => (
          <div key={item.label}>
            {item.dropdown ? (
              <>
                <p className="font-mono text-xs tracking-widest text-accent-ui uppercase">
                  {item.label}
                </p>
                <div className="mt-3 grid gap-3">
                  {item.dropdown.columns.map((column) => (
                    <a
                      key={column.title}
                      href={column.href}
                      className="rounded-md border border-border bg-surface p-4"
                    >
                      <span className="text-sm font-semibold text-fg">
                        {column.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted">
                        {column.description}
                      </span>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <a
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cx(
                  "block rounded-md border border-border bg-surface px-4 py-3 text-sm font-semibold text-fg",
                  isActivePath(path, item.href) && "border-accent-ui",
                )}
              >
                {item.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SiteNav({ path = "/" }: SiteNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-nav-border bg-nav-bg shadow-[var(--theme-nav-shadow)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <div className="flex h-full items-center gap-8">
          <a
            href="/"
            className="inline-flex items-center gap-2"
            aria-label="Parlè home"
          >
            <img src="/parle-icon-v5.png" alt="" className="h-8 w-auto" />
            <span
              className="text-2xl tracking-wide text-fg"
              style={{ fontFamily: "'Momo Trust Display', sans-serif" }}
            >
              Parlè
            </span>
          </a>
          <nav
            className="hidden h-full items-stretch lg:flex"
            aria-label="Primary navigation"
          >
            {primaryNav.map((item) => (
              <DesktopNavItem key={item.label} item={item} path={path} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <ThemeToggle />
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="/login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-button-bg text-sm font-semibold text-fg transition hover:border-accent-ui hover:bg-button-hover"
              aria-label="Log in"
            >
              <FontAwesomeIcon icon={faLock} />
            </a>
            <a
              href="/install"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-button-bg px-4 text-sm font-semibold text-fg transition hover:border-accent-ui hover:bg-button-hover"
            >
              <FontAwesomeIcon icon={faTerminal} /> Install
            </a>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-button-bg text-fg lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="text-xl" aria-hidden="true">
              {mobileOpen ? "×" : "≡"}
            </span>
          </button>
        </div>
      </div>
      {mobileOpen && <MobileMenu items={primaryNav} path={path} />}
    </header>
  );
}
