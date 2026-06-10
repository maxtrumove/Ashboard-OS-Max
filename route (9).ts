import Link from "next/link";

export default function PuppetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-panelborder bg-panel px-4 py-2">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-100">
          <span className="text-accent">◆</span> agent-puppets
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/god-mode" className="text-accent hover:text-accent/80">
            ⚡ God Mode
          </Link>
          <Link href="/settings" className="text-slate-400 hover:text-slate-100">
            Settings
          </Link>
        </nav>
      </header>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
