import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import { TicketStatus } from "@prisma/client";

const STATUS_OPTIONS = [
  { value: "ABERTO", label: "Aberto" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "AGUARDANDO", label: "Aguardando" },
  { value: "RESOLVIDO", label: "Resolvido" },
  { value: "FECHADO", label: "Fechado" },
];

async function addComment(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/entrar");
  const ticketId = String(formData.get("ticketId"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.ticketComment.create({
    data: { ticketId, authorId: session.user.id, body },
  });
  revalidatePath(`/chamados/${ticketId}`);
}

async function updateStatus(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/entrar");
  const role = session.user.role;
  if (role !== "TI" && role !== "ADMIN") return;

  const ticketId = String(formData.get("ticketId"));
  const status = String(formData.get("status")) as TicketStatus;
  await db.ticket.update({
    where: { id: ticketId },
    data: { status, closedAt: status === "FECHADO" ? new Date() : null },
  });
  revalidatePath(`/chamados/${ticketId}`);
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");
  const { id } = await params;

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      requester: true,
      assignee: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket) notFound();

  const role = session.user.role;
  const isTI = role === "TI" || role === "ADMIN";
  const canView = isTI || ticket.requesterId === session.user.id;
  if (!canView) redirect("/chamados");

  return (
    <main className="min-h-screen px-6 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/chamados" className="text-xs text-gold-50/50 hover:text-gold-300">
          ← Chamados
        </Link>
        <h1 className="font-display text-3xl text-gold-50 mt-2">
          <span className="font-mono text-gold-300">{ticket.protocol}</span>{" "}
          {ticket.subject}
        </h1>
        <div className="text-xs text-gold-50/50 mt-1">
          Aberto em{" "}
          {format(ticket.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })} ·{" "}
          {ticket.requester.name ?? ticket.requester.email}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-gold-50/50">Categoria</div>
            <div className="text-gold-50">{ticket.category}</div>
          </div>
          <div>
            <div className="text-gold-50/50">Prioridade</div>
            <div className="text-gold-50">{ticket.priority}</div>
          </div>
          <div>
            <div className="text-gold-50/50">Status</div>
            <div className="text-gold-50">{ticket.status}</div>
          </div>
        </div>
        <p className="text-sm text-gold-50/90 whitespace-pre-wrap pt-2 border-t border-gold-300/10">
          {ticket.description}
        </p>
      </div>

      {isTI && (
        <form
          action={updateStatus}
          className="glass rounded-2xl p-4 flex items-center gap-3"
        >
          <input type="hidden" name="ticketId" value={ticket.id} />
          <label className="text-xs text-gold-50/60">Atualizar status</label>
          <select
            name="status"
            defaultValue={ticket.status}
            className="rounded-lg bg-navy-800/60 border border-gold-300/20 px-3 py-2 text-sm outline-none focus:border-gold-300"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-gold-300 text-navy-900 font-semibold px-4 py-2 text-sm hover:bg-gold-100"
          >
            Salvar
          </button>
        </form>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-xl text-gold-50">Comentários</h2>
        <div className="space-y-3">
          {ticket.comments.length === 0 && (
            <p className="text-sm text-gold-50/50">Sem comentários ainda.</p>
          )}
          {ticket.comments.map((c) => (
            <div key={c.id} className="glass rounded-xl p-3">
              <div className="text-xs text-gold-50/50 mb-1">
                {c.author.name ?? c.author.email} ·{" "}
                {format(c.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </div>
              <p className="text-sm text-gold-50/90 whitespace-pre-wrap">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <form action={addComment} className="glass rounded-2xl p-4 space-y-2">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <textarea
            name="body"
            required
            rows={3}
            placeholder="Escrever um comentário…"
            className="w-full rounded-lg bg-navy-800/60 border border-gold-300/20 px-3 py-2 text-sm outline-none focus:border-gold-300"
          />
          <button
            type="submit"
            className="rounded-lg bg-gold-300 text-navy-900 font-semibold px-4 py-2 text-sm hover:bg-gold-100"
          >
            Comentar
          </button>
        </form>
      </section>
    </main>
  );
}
