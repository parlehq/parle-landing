import { useState } from "react";

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

  return (
    <div
      className="group h-full"
      onMouseDown={(event) => event.stopPropagation()}
    >
      <a
        href={item.href ?? "#"}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={cx(
          "flex h-full items-center px-3 text-sm font-medium text-ink-200 transition hover:text-white",
          active && "text-white",
        )}
        aria-current={active ? "page" : undefined}
      >
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1">
          {item.label}
          {item.dropdown && (
            <svg
              className="h-4 w-4 transition duration-200 group-hover:rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </a>
      {item.dropdown && (
        <div className="pointer-events-none fixed left-0 top-16 z-30 w-full translate-y-1 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <NavDropdown dropdown={item.dropdown} />
        </div>
      )}
    </div>
  );
}

function MobileMenu({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <div className="border-t border-white/10 bg-ink-950/95 px-6 py-6 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            {item.dropdown ? (
              <>
                <p className="font-mono text-xs tracking-widest text-ink-300 uppercase">
                  {item.label}
                </p>
                <div className="mt-3 grid gap-3">
                  {item.dropdown.columns.map((column) => (
                    <a
                      key={column.title}
                      href={column.href}
                      className="rounded-md border border-white/10 bg-white/4 p-4"
                    >
                      <span className="text-sm font-semibold text-white">
                        {column.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-ink-100/68">
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
                  "block rounded-md border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white",
                  isActivePath(path, item.href) && "border-ink-400",
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
        <div className="flex h-full items-center gap-8">
          <a
            href="/"
            className="inline-flex items-center gap-2"
            aria-label="Parlè home"
          >
            <img src="/parle-icon-v4.png" alt="" className="h-8 w-auto" />
            <span
              className="text-2xl tracking-wide text-ink-100"
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
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/login"
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-ink-400 hover:bg-white/5"
          >
            <i class="fa-solid fa-lock"></i>
          </a>
          <a
            href="/install"
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-ink-400 hover:bg-white/5"
          >
            <i class="fa-solid fa-terminal"></i> Install
          </a>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-ink-100 lg:hidden"
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
      {mobileOpen && <MobileMenu items={primaryNav} path={path} />}
    </header>
  );
}
