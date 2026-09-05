import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { fmtDateTime, fmtDate } from '@/lib/format';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

const STATUS_STYLE: Record<string, string> = {
  ABERTO: 'bg-sky-500/15 text-sky-300',
  EM_ANDAMENTO: 'bg-amber-500/15 text-amber-300',
  AGUARDANDO_USUARIO: 'bg-violet-500/15 text-violet-300',
  RESOLVIDO: 'bg-emerald-500/15 text-emerald-300',
  FECHADO: 'bg-slate-500/15 text-slate-300'
};

async function addComment(ticketId: number, formData: FormData) {
  'use server';
  const session = await auth();
  const uid = (session?.user as any)?.id;
  if (!uid) throw new Error('unauth');
  const body = String(formData.get('body') ?? '').trim();
  if (!body) return;
  await prisma.ticketComment.create({ data:{ ticketId, authorId: uid, body } });
  revalidatePath(`/chamados/${ticketId}`);
}

async function updateStatus(ticketId: number, formData: FormData) {
  'use server';
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== 'TI' && role !== 'ADMIN') return;
  const status = String(formData.get('status') ?? '') as any;
  const closedAt = status === 'FECHADO' || status === 'RESOLVIDO' ? new Date() : null;
  await prisma.ticket.update({ where:{id:ticketId}, data:{ status, closedAt } });
  revalidatePath(`/chamados/${ticketId}`);
}

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/entrar');
  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isFinite(ticketId)) notFound();

  const t = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { requester:true, assignee:true, comments: { include:{author:true}, orderBy:{createdAt:'asc'} } }
  });
  if (!t) notFound();
  const isTi = (session.user as any).role === 'TI' || (session.user as any).role === 'ADMIN';

  return (
    <Shell active="ticket">
      <div className="mx-auto max-w-3xl fade-up">
        <Link href="/chamados" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-100">
          <Icon name="arrow_back" size={16} /> Voltar aos chamados
        </Link>

        <div className="panel p-6 mb-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs font-semibold text-gold-300">{t.protocol}</div>
              <h2 className="mt-1 font-display text-2xl font-normal leading-tight">{t.subject}</h2>
              <div className="mt-2 text-xs text-ink-500">
                Aberto por <b className="text-ink-300">{t.requester.name ?? t.requester.email}</b> · {fmtDateTime(t.createdAt)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">Status</div>
              <div className={`mt-1 inline-block rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_STYLE[t.status]}`}>
                {t.status.replaceAll('_',' ')}
              </div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">Prioridade</div>
              <div className="mt-1 inline-block rounded-pill bg-gold-300/15 px-3 py-1 text-xs font-semibold text-gold-300">
                {t.priority}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[.02] p-4 text-sm leading-relaxed text-ink-300 whitespace-pre-wrap">
            {t.description}
          </div>

          {isTi && (
            <form action={updateStatus.bind(null, t.id)} className="mt-4 flex items-center gap-2">
              <select name="status" defaultValue={t.status} className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-1.5 text-sm">
                {['ABERTO','EM_ANDAMENTO','AGUARDANDO_USUARIO','RESOLVIDO','FECHADO'].map(s => (
                  <option key={s} value={s}>{s.replaceAll('_',' ')}</option>
                ))}
              </select>
              <button className="rounded-lg bg-gold-gradient px-3 py-1.5 text-sm font-semibold text-navy-900">Atualizar status</button>
            </form>
          )}
        </div>

        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-ink-500">Conversa</div>
        <div className="space-y-2">
          {t.comments.length === 0 && <p className="text-sm text-ink-500">Sem mensagens ainda.</p>}
          {t.comments.map(c => {
            const isAdmin = c.author.role === 'TI' || c.author.role === 'ADMIN';
            return (
              <div key={c.id} className={`rounded-lg border p-4 ${isAdmin ? 'border-gold-300/25 bg-gold-300/[.05]' : 'border-white/5 bg-white/[.02]'}`}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${isAdmin ? 'bg-gold-gradient text-navy-900' : 'bg-emerald-500/15 text-emerald-300'}`}>
                      {(c.author.name ?? '?').split(' ').map(s=>s[0]).slice(0,2).join('')}
                    </div>
                    <b className="text-sm">{c.author.name ?? c.author.email}</b>
                    {isAdmin && <span className="rounded bg-gold-300/15 px-1.5 text-[10px] tracking-wider text-gold-300">TI</span>}
                  </div>
                  <span className="text-[11px] text-ink-500">{fmtDate(c.createdAt, "dd/MM 'às' HH:mm")}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.body}</p>
              </div>
            );
          })}
        </div>

        <form action={addComment.bind(null, t.id)} className="mt-3 panel p-3">
          <textarea name="body" rows={3} placeholder="Escreva uma resposta..." className="w-full bg-transparent p-1 outline-none resize-y text-sm" />
          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <div className="flex gap-1 text-ink-500">
              <Icon name="attach_file" size={20} />
              <Icon name="alternate_email" size={20} />
            </div>
            <button className="rounded-lg bg-gold-gradient px-4 py-1.5 text-sm font-semibold text-navy-900">Enviar</button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
