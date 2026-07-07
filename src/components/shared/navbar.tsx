"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Upload" },
  { href: "/compare", label: "Compare" },
  { href: "/bills", label: "My Bills" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-tight">
          <span className="flex size-9 -rotate-6 items-center justify-center rounded-2xl border-2 border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)]">
            <Receipt className="size-4.5" />
          </span>
          ClearBill
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 transition-colors",
                  active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
