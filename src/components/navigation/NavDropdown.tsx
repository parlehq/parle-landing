import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { Dropdown } from "./navData";
import { navIcons } from "./icons";

export default function NavDropdown({ dropdown }: { dropdown: Dropdown }) {
  return (
    <div className="w-full border-b border-sand-600/14 bg-sand-50/96 shadow-[0_24px_80px_rgba(24,32,51,0.10)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-8 px-8 py-10 lg:grid-cols-4">
        <div className="grid gap-5 lg:col-span-3 lg:grid-cols-3">
          {dropdown.columns.map((column) => (
            <a
              key={column.title}
              href={column.href}
              className="group relative block overflow-hidden rounded-md border border-sand-600/18 bg-white/42 p-6 shadow-[0_14px_40px_rgba(24,32,51,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-sand-600/36 hover:bg-white/70"
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(135deg, ${column.accent}20, transparent 58%)`,
                }}
              />
              <span className="relative flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center text-sm font-semibold"
                  style={{ color: column.accent }}
                >
                  {navIcons[column.icon] && (
                    <FontAwesomeIcon
                      icon={navIcons[column.icon]}
                      className="text-lg"
                    />
                  )}
                </span>
                <span>
                  <span
                    className="block font-mono text-xs tracking-widest uppercase"
                    style={{ color: column.accent }}
                  >
                    {column.eyebrow}
                  </span>
                  <span className="mt-1 block text-lg font-semibold text-ink-100">
                    {column.title}
                  </span>
                </span>
              </span>
              <span className="relative mt-5 block text-sm leading-6 text-ink-200">
                {column.description}
              </span>
              <span className="relative mt-6 flex items-center justify-between rounded-md border border-sand-600/10 bg-sand-100/72 px-4 py-3 text-sm font-medium text-ink-100 transition group-hover:border-sand-600/24 group-hover:bg-sand-50">
                {column.cta ?? column.eyebrow}
                <span
                  className="transition group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
        <div className="rounded-md border border-sand-600/18 bg-white/42 p-6 shadow-[0_14px_40px_rgba(24,32,51,0.05)]">
          <p className="font-mono text-xs tracking-widest text-sand-600 uppercase">
            {dropdown.aside.title}
          </p>
          <div className="mt-5 space-y-5">
            {dropdown.aside.links.map((link) => (
              <a key={link.label} href={link.href} className="group block">
                <span className="block text-sm font-semibold text-ink-100 transition group-hover:text-sand-600">
                  {link.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-ink-200">
                  {link.description}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
