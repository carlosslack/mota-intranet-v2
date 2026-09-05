import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";

function greeting(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function initials(name?: string | null, email?: string | null) {
  const base = (name ?? email ?? "?").trim();
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

const APPS = [
  { name: "Meet", href: "https://meet.google.com", icon: "videocam", external: true },
  { name: "Chamado TI", href: "/chamados/novo", icon: "support_agent", external: false },
  { name: "Arquivos", href: "https://drive.google.com", icon: "folder_open", external: true },
  { name: "CRM", href: "/crm", icon: "groups", external: false },
  { name: "Agenda", href: "/agenda", icon: "event", external: false },
  { name: "Gmail", href: "https://mail.google.com", icon: "mail", external: true },
];

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const user = session.user;
  const now = new Date();
  const first = user.name?.split(" ")[0] ?? "";

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg glass flex items-center justify-center">
            <span className="font-display text-gold-300 text-xl font-semibold">M</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-gold-300 tracking-wide text-sm font-semibold">
              MOTA
            </div>
            <div className="text-[10px] text-gold-50/60 uppercase tracking-widest">
              &amp; Advogados
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chamados"
            className="text-sm text-gold-50/70 hover:text-gold-300 transition"
          >
            Meus chamados
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/entrar" });
            }}
          >
            <button
              type="submit"
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-xs font-semibold text-gold-300 hover:border-gold-300/40 transition"
              title={user.email ?? undefined}
            >
              {initials(user.name, user.email)}
            </button>
          </form>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 gap-10">
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl md:text-5xl text-gold-50">
            {greeting(now)}
            {first ? `, ${first}` : ""}.
          </h1>
          <p className="text-gold-50/60 text-sm">
            Como posso ajudar você hoje?
          </p>
        </div>

        <form
          action="/api/ai/chat"
          method="post"
          className="w-full max-w-2xl glass rounded-2xl p-2 flex items-center gap-2"
        >
          <Icon name="auto_awesome" className="text-gold-300 pl-3" />
          <input
            name="q"
            disabled
            placeholder="Pergunte algo — em breve"
            className="flex-1 bg-transparent outline-none px-2 py-3 text-sm placeholder:text-gold-50/40"
          />
          <button
            type="submit"
            disabled
            className="rounded-xl bg-gold-300/20 text-gold-300 px-4 py-2 text-sm disabled:opacity-50"
          >
            Enviar
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {[
            "Abrir chamado de TI",
            "Resumir o processo do cliente X",
            "Modelo de petição inicial",
            "Agenda de hoje",
          ].map((s) => (
            <span
              key={s}
              className="text-xs px-3 py-1.5 rounded-full glass text-gold-50/70"
            >
              {s}
            </span>
          ))}
        </div>

        <nav className="w-full max-w-3xl grid grid-cols-3 md:grid-cols-6 gap-3">
          {APPS.map((app) => (
            <a
              key={app.name}
              href={app.href}
              target={app.external ? "_blank" : undefined}
              rel={app.external ? "noreferrer" : undefined}
              className="glass rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-gold-300/40 transition group"
            >
              <Icon
                name={app.icon}
                className="text-gold-300 text-3xl group-hover:scale-110 transition"
              />
              <span className="text-xs text-gold-50/80">{app.name}</span>
            </a>
          ))}
        </nav>
      </section>

      <footer className="text-center py-4 text-[11px] text-gold-50/40">
        MOTA &amp; Advogados · Intranet v2
      </footer>
    </main>
  );
}
