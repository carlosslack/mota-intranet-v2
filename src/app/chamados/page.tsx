import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { fmtDateTime } from '@/lib/format';

const STATUS_STYLE: Record<string, string> = {
  ABERTO: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  EM_ANDAMENTO: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  AGUARDANDO_USUARIO: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  RESOLVIDO: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  FECHADO: 'bg-slate-500/15 text-slate-300 border-slate-400/30'
};
const STATUS_LABEL: Record<string, string> = {
  ABERTO: 'Aberto', EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_USUARIO: 'Aguardando usuário', RESOLVIDO: 'Resolvido', FECHADO: 'Fechado'
};
const CAT_LABEL: Record<string, string> = {
  REDE: 'Rede', IMPRESSORA: 'Impressora', SOFTWARE_JURIDICO: 'Software jurídico',
  ACESSO: 'Acesso', HARDWARE: 'Hardware', EMAIL: 'E-mail', OUTRO: 'Outro'
};

export default async function ChamadosPage() {
  const session = await auth();
  const isTi = (session?.user as any)?.role === 'TI' || (session?.user as any)?.role === 'ADMIN';
  const myId = (session?.user as any)?.id;

  const where = isTi ? {} : { requesterId: myId };
  const [tickets, aberto, andamento, aguard, resolv] = await Promise.all([
    prisma.ticket.findMany({ where, orderBy:{createdAt:'desc'}, take:50, include:{requester:true} }),
    prisma.ticket.count({ where: { ...where, status: 'ABERTO' } }),
    prisma.ticket.count({ where: { ...where, status: 'EM_ANDAMENTO' } }),
    prisma.ticket.count({ where: { ...where, status: 'AGUARDANDO_USUARIO' } }),
    prisma.ticket.count({ where: { ...where, status: 'RESOLVIDO' } })
  ]);

  const stats = [
    { label:'Abertos',              value: aberto,    sub:'aguardando triagem',       icon:'inbox',              color:'text-sky-400' },
    { label:'Em andamento',         value: andamento, sub:'sob responsabilidade TI',  icon:'progress_activity',  color:'text-amber-400' },
    { label:'Aguardando usuário',   value: aguard,    sub:'resposta pendente',        icon:'schedule',           color:'text-violet-400' },
    { label:'Resolvidos (todos)',   value: resolv,    sub:'nos últimos períodos',     icon:'task_alt',           color:'text-emerald-400' }
  ];

  return (
    <Shell active="tickets">
      <div className="fade-up">
        <div className="mb-5 grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="panel p-4">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                <Icon name={s.icon} size={16} className={s.color} />{s.label}
              </div>
              <div className="font-display text-3xl font-normal leading-none">{s.value}</div>
              <div className="mt-1 text-[11px] text-ink-500">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <Chip active>Todos ({tickets.length})</Chip>
          {isTi && <Chip>Meus atribuídos</Chip>}
          <Chip>Rede &amp; Internet</Chip>
          <Chip>Software jurídico</Chip>
          <Chip>Acesso / Senha</Chip>
        </div>

        <div className="panel overflow-hidden">
          <div className="grid grid-cols-[110px_1fr_130px_170px_140px_130px] gap-4 border-b border-white/5 bg-white/[.02] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.16em] text-ink-500">
            <div>Protocolo</div><div>Assunto</div><div>Categoria</div><div>Solicitante</div><div>Status</div><div>Aberto em</div>
          </div>
          {tickets.length === 0 && (
            <div className="p-12 text-center text-sm text-ink-500">Nenhum chamado encontrado. <Link href="/chamados/novo" className="text-gold-300">Abrir o primeiro →</Link></div>
          )}
          {tickets.map(t => (
            <Link key={t.id} href={`/chamados/${t.id}`}
              className="grid grid-cols-[110px_1fr_130px_170px_140px_130px] items-center gap-4 border-b border-white/5 px-5 py-3 text-sm hover:bg-white/[.02]">
              <span className="font-mono text-xs font-semibold text-gold-300">{t.protocol}</span>
              <div>
                <b className="block leading-tight">{t.subject}</b>
                {(t.priority === 'URGENTE' || t.priority === 'ALTA') && (
                  <span className="text-[10px] uppercase tracking-wider text-rose-300">● {t.priority === 'URGENTE' ? 'Urgente' : 'Alta'}</span>
                )}
              </div>
              <span className="text-ink-300 text-xs">{CAT_LABEL[t.category] ?? t.category}</span>
              <span className="text-ink-300 text-xs">{t.requester.name ?? t.requester.email}</span>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-[11px] ${STATUS_STYLE[t.status] ?? ''}`}>
                {STATUS_LABEL[t.status] ?? t.status}
              </span>
              <span className="text-[11px] text-ink-500">{fmtDateTime(t.createdAt)}</span>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  const cls = active
    ? 'bg-gold-300/15 text-gold-300 border-gold-300/35'
    : 'bg-transparent text-ink-300 border-white/10';
  return <span className={`rounded-pill border px-3 py-1 text-xs cursor-pointer ${cls}`}>{children}</span>;
}
