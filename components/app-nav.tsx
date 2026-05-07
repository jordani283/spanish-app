"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "◔" },
  { href: "/review", label: "Review", icon: "↺" },
  { href: "/vocab/new", label: "Add", icon: "+" },
  { href: "/grammar", label: "Grammar", icon: "✎" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900" href="/">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              B2
            </span>
            Camino B2
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-slate-600 md:flex">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  className={`rounded-xl px-3 py-2 transition ${
                    isActive ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-xl text-xs font-medium transition ${
                pathname.startsWith(link.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
              href={link.href}
            >
              <span className="text-sm">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
