import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Icon } from "@/components/Icon";

const STATUS_STYLES: Record<string, string> = {
  ABERTO: "bg-blue-500/20 text-blue-200 border-blue-400/30",
  EM_ANDAMENTO: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
  AGUARDANDO: "bg-orange-500/20 text-orange-200 border-orange-400/30",
  RESOLVIDO: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  FECHADO: "bg-slate-500/20 text-slate-200 border-slate-400/30",
};

const STATUS_LABEL: Record<string, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO: "Aguardando",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};

export default async function ChamadosPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const role = session.user.role;
  const isTI = role === "TI" || role === "ADMIN";

  const tickets = await db.ticket.findMany({
    where: isTI ? undefined : { requesterId: session.user.id },
    include: { requester: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="min-h-screen px-6 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-gold-50/50 hover:text-gold-300">
            ← Início
          </Link>
          <h1 className="font-display text-3xl text-gold-50 mt-2">Chamados</h1>
          <p className="text-sm text-gold-50/60">
            {isTI ? "Todos os chamados abertos na intranet" : "Meus chamados"}
          </p>
        </div>
        <Link
          href="/chamados/novo"
          className="flex items-center gap-2 rounded-xl bg-gold-300 text-navy-900 font-semibold px-4 py-2 hover:bg-gold-100 transition"
        >
          <Icon name="add" /> Novo chamado
        </Link>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-gold-50/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Protocolo</th>
              <th className="px-4 py-3">Assunto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Solicitante</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aberto em</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gold-50/50"
                >
                  Nenhum chamado por enquanto.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-t border-gold-300/10 hover:bg-navy-800/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/chamados/${t.id}`}
                      className="font-mono text-gold-300 hover:underline"
                    >
                      {t.protocol}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gold-50">{t.subject}</td>
                  <td className="px-4 py-3 text-gold-50/70">{t.category}</td>
                  <td className="px-4 py-3 text-gold-50/70">
                    {t.requester.name ?? t.requester.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border ${
                        STATUS_STYLES[t.status] ?? ""
                      }`}
                    >
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gold-50/60 text-xs">
                    {format(t.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
