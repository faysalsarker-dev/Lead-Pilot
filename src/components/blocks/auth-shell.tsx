import type { ReactNode } from "react";
import { LockKeyhole, Rocket } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-foreground">
      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#172554] text-white shadow-sm">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-[#2563eb]">{eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>

          {children}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <LockKeyhole className="h-3.5 w-3.5" />
            <span>Protected by encrypted session tokens</span>
          </div>
        </div>
      </section>
    </main>
  );
}
