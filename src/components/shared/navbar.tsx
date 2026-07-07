import Link from "next/link";
import { Receipt } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Receipt className="size-4" />
          </span>
          <span className="text-lg">ClearBill</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/" className="rounded-full px-4 py-2 text-muted-foreground transition hover:text-foreground">
            Upload
          </Link>
          <Link href="/compare" className="rounded-full px-4 py-2 text-muted-foreground transition hover:text-foreground">
            Compare
          </Link>
          <Link href="/bills" className="rounded-full px-4 py-2 text-muted-foreground transition hover:text-foreground">
            My Bills
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
