import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faLock,
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
          "flex h-full items-center px-3 text-sm font-semibold text-ink-100/82 transition hover:text-ink-100",
          active && "text-ink-100",
        )}
        aria-current={active ? "page" : undefined}
      >
        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1">
          {item.label}
          {item.dropdown && (
            <FontAwesomeIcon
              icon={faChevronDown}
              className="text-xs transition duration-200 group-hover:rotate-180"
            />
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
    <div className="border-t border-ink-100/10 bg-ink-950/95 px-6 py-6 shadow-2xl backdrop-blur-xl lg:hidden">
      <div className="space-y-5">
        <a
          href="/install"
          className="flex items-center justify-center gap-2 rounded-md border border-sand-600/18 bg-sand-100/55 px-4 py-3 text-sm font-semibold text-ink-100"
        >
          <FontAwesomeIcon icon={faTerminal} /> Install
        </a>
        {items.map((item) => (
          <div key={item.label}>
            {item.dropdown ? (
              <>
                <p className="font-mono text-xs tracking-widest text-sand-600 uppercase">
                  {item.label}
                </p>
                <div className="mt-3 grid gap-3">
                  {item.dropdown.columns.map((column) => (
                    <a
                      key={column.title}
                      href={column.href}
                      className="rounded-md border border-sand-600/14 bg-sand-100/45 p-4"
                    >
                      <span className="text-sm font-semibold text-ink-100">
                        {column.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-ink-200">
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
                  "block rounded-md border border-sand-600/14 bg-sand-100/45 px-4 py-3 text-sm font-semibold text-ink-100",
                  isActivePath(path, item.href) && "border-sand-600",
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
    <header className="sticky top-0 z-40 border-b border-sand-600/16 bg-sand-50/96 shadow-[0_1px_0_rgba(255,255,255,0.55),0_12px_40px_rgba(24,32,51,0.06)] backdrop-blur">
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
            className="inline-flex items-center justify-center rounded-md border border-ink-100/18 bg-white/40 px-4 py-2 text-sm font-semibold text-ink-100 transition hover:border-sand-600/50 hover:bg-white/70"
            aria-label="Log in"
          >
            <FontAwesomeIcon icon={faLock} />
          </a>
          <a
            href="/install"
            className="inline-flex items-center gap-2 rounded-md border border-ink-100/18 bg-white/40 px-4 py-2 text-sm font-semibold text-ink-100 transition hover:border-sand-600/50 hover:bg-white/70"
          >
            <FontAwesomeIcon icon={faTerminal} /> Install
          </a>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-sand-600/14 bg-sand-100/55 text-ink-100 lg:hidden"
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
