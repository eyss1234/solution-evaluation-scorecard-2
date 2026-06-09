import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/solutions", label: "Solutions" },
  { href: "/criteria", label: "Criteria" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm">
            SE
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Solution Evaluation Scorecard
          </span>
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-surface-subtle hover:text-slate-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="flex items-center justify-center gap-1 border-t border-surface-border px-4 py-2 sm:hidden">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-surface-subtle hover:text-slate-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
