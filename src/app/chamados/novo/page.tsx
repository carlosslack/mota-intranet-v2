import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { nextTicketProtocol } from "@/lib/protocol";
import { revalidatePath } from "next/cache";
import { TicketCategory, TicketPriority } from "@prisma/client";

const CATEGORIES = [
  { value: "HARDWARE", label: "Hardware" },
  { value: "SOFTWARE", label: "Software" },
  { value: "REDE", label: "Rede" },
  { value: "ACESSO", label: "Acesso / Senhas" },
  { value: "IMPRESSAO", label: "Impressão" },
  { value: "EMAIL", label: "E-mail" },
  { value: "OUTRO", label: "Outro" },
];

const PRIORITIES = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Média" },
  { value: "ALTA", label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
];

async function createTicket(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const subject = String(formData.get("subject") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "OUTRO");
  const priority = String(formData.get("priority") ?? "MEDIA");

  if (!subject || !description) {
    throw new Error("Assunto e descrição são obrigatórios.");
  }

  const protocol = await nextTicketProtocol();
  const adminEmail = process.env.GOOGLE_ADMIN_EMAIL ?? "ti@mota.adv.br";
  const admin = await db.user.findUnique({ where: { email: adminEmail } });

  const ticket = await db.ticket.create({
    data: {
      protocol,
      subject,
      description,
      category: category as TicketCategory,
      priority: priority as TicketPriority,
      requesterId: session.user.id,
      assigneeId: admin?.id ?? null,
    },
  });

  revalidatePath("/chamados");
  redirect(`/chamados/${ticket.id}`);
}

export default async function NovoChamadoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  return (
    <main className="min-h-screen px-6 py-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/chamados" className="text-xs text-gold-50/50 hover:text-gold-300">
          ← Chamados
        </Link>
        <h1 className="font-display text-3xl text-gold-50 mt-2">Novo chamado</h1>
      </div>

      <form action={createTicket} className="glass rounded-2xl p-6 space-y-4">
        <label className="block">
          <span className="text-xs text-gold-50/60">Assunto</span>
          <input
            name="subject"
            required
            className="mt-1 w-full rounded-lg bg-navy-800/60 border border-gold-300/20 px-3 py-2 outline-none focus:border-gold-300"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-gold-50/60">Categoria</span>
            <select
              name="category"
              className="mt-1 w-full rounded-lg bg-navy-800/60 border border-gold-300/20 px-3 py-2 outline-none focus:border-gold-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-gold-50/60">Prioridade</span>
            <select
              name="priority"
              defaultValue="MEDIA"
              className="mt-1 w-full rounded-lg bg-navy-800/60 border border-gold-300/20 px-3 py-2 outline-none focus:border-gold-300"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-gold-50/60">Descrição</span>
          <textarea
            name="description"
            required
            rows={6}
            className="mt-1 w-full rounded-lg bg-navy-800/60 border border-gold-300/20 px-3 py-2 outline-none focus:border-gold-300"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-gold-300 text-navy-900 font-semibold py-3 hover:bg-gold-100 transition"
        >
          Abrir chamado
        </button>
      </form>
    </main>
  );
}
