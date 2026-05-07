import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/review", label: "Review" },
  { href: "/vocab/new", label: "Add vocab" },
  { href: "/grammar", label: "Grammar" },
];

export function AppNav() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <Link className="text-sm font-semibold tracking-wide text-zinc-900" href="/">
          Camino B2
        </Link>
        <nav className="flex items-center gap-3 text-sm text-zinc-600">
          {links.map((link) => (
            <Link key={link.href} className="rounded-md px-2 py-1 hover:bg-zinc-100 hover:text-zinc-900" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
