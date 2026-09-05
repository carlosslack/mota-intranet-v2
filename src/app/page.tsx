import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { timeAgo, fmtDate } from '@/lib/format';

export default async function HomePage() {
  const [announcements, upcoming] = await Promise.all([
    prisma.announcement.findMany({ orderBy:{createdAt:'desc'}, take: 3 }).catch(()=>[]),
    prisma.activity.findMany({ where: { dueAt: { gte: new Date() } }, orderBy: { dueAt: 'asc' }, take: 2 }).catch(()=>[])
  ]);

  const h = new Date().getHours();
  const greeting = h >= 5 && h < 12 ? 'Bom dia' : h >= 12 && h < 18 ? 'Boa tarde' : 'Boa noite';

  const dockApps = [
    { title:'Meet', hint:'Criar reunião', icon:'videocam', bg:'bg-emerald-500/15', color:'text-emerald-400', href:'https://meet.google.com/new', external:true },
    { title:'Chamado TI', hint:'Abrir novo', icon:'support_agent', bg:'bg-rose-500/15', color:'text-rose-400', href:'/chamados/novo' },
    { title:'Arquivos', hint:'Drive do escritório', icon:'folder_managed', bg:'bg-sky-500/15', color:'text-sky-400', href:'https://drive.google.com', external:true },
    { title:'CRM', hint:'Casos e clientes', icon:'gavel', bg:'bg-gold-300/15', color:'text-gold-300', href:'/casos' },
    { title:'Agenda', hint:'Prazos e reuniões', icon:'event', bg:'bg-violet-500/15', color:'text-violet-400', href:'/agenda' },
    { title:'Gmail', hint:'E-mail corporativo', icon:'mail', bg:'bg-gold-300/10', color:'text-gold-300', href:'https://mail.google.com', external:true }
  ];
  const suggestions = ['Conectar na impressora','Configurar acesso remoto','Acessar Drive compartilhado','Redefinir senha'];

  return (
    <Shell active="home">
      <div className="fade-up">
        {/* IA hero */}
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.32em] text-gold-300">{greeting} · Assistente Interno</div>
          <h2 className="mb-2 font-display text-4xl font-light leading-tight">Como posso <span className="font-normal text-gold-300">ajudar</span> hoje?</h2>
          <p className="mb-6 text-ink-300">Tire dúvidas de protocolos, TI e do escritório — ou acesse um sistema abaixo.</p>

          <div className="w-full max-w-[640px] overflow-hidden rounded-2xl panel">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2 text-[11px] text-ink-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Assistente Mota · reservado para integração
              <span className="ml-auto font-mono text-[10px]">openrouter · gemini-2.5-flash</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="font-mono text-lg text-gold-300">›</span>
              <input placeholder="Digite sua dúvida e pressione Enter..." disabled className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-ink-500" />
              <button disabled className="grid h-9 w-9 place-items-center rounded-lg bg-gold-gradient text-navy-900 disabled:opacity-50"><Icon name="send" size={18} /></button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {suggestions.map(s => (
              <span key={s} className="rounded-pill border border-white/10 bg-white/[.03] px-3 py-1 text-xs text-ink-300">{s}</span>
            ))}
          </div>
        </div>

        {/* Dock */}
        <div className="mt-4 grid grid-cols-6 gap-3 border-t border-white/5 pt-6">
          {dockApps.map(app => {
            const inner = (
              <>
                <div className={`grid h-11 w-11 place-items-center rounded-lg ${app.bg} ${app.color}`}><Icon name={app.icon} size={22} /></div>
                <b className="text-sm">{app.title}</b>
                <span className="text-[11px] text-ink-500 text-center">{app.hint}</span>
              </>
            );
            const cls = "group flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[.02] p-4 transition hover:-translate-y-0.5 hover:border-gold-300/30 hover:bg-white/[.04]";
            return app.external
              ? <a key={app.title} href={app.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
              : <Link key={app.title} href={app.href} className={cls}>{inner}</Link>;
          })}
        </div>

        {/* Comunicados + Aniversariantes */}
        <div className="mt-8 grid grid-cols-[1.3fr_1fr] gap-4">
          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gold-300/10 text-gold-300"><Icon name="campaign" size={18} /></div>
              <b className="font-display">Comunicados</b>
              <Link href="/comunicados" className="ml-auto text-xs text-gold-300">Ver todos →</Link>
            </div>
            {announcements.length === 0 && <p className="py-6 text-center text-sm text-ink-500">Nenhum comunicado ainda.</p>}
            {announcements.map(a => (
              <div key={a.id} className="border-t border-dashed border-white/5 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <b className="text-sm">{a.title}</b>
                  <span className="text-[11px] text-ink-500">{timeAgo(a.createdAt)}</span>
                </div>
                <p className="text-xs leading-relaxed text-ink-300">{a.body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="panel p-5">
              <div className="mb-2 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-violet-400"><Icon name="cake" size={18} /></div>
                <b className="font-display">Aniversariantes</b>
              </div>
              <BirthdayRow initials="FZ" name="Fernanda Zaffari Prado" area="Trabalhista" date="11/09" />
              <BirthdayRow initials="JR" name="João Ricardo Souza"     area="Cível"       date="14/09" />
            </div>

            <div className="panel p-5">
              <div className="mb-2 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-500/15 text-sky-400"><Icon name="event_upcoming" size={18} /></div>
                <b className="font-display">Próximos prazos</b>
              </div>
              {upcoming.length === 0 ? (
                <>
                  <UpcomingRow day="09" month="SET" title="Audiência · Vale do Guaíba" sub="2ª Vara Cível · 14h · presencial" />
                  <UpcomingRow day="12" month="SET" title="Prazo · Recurso Ordinário"  sub="Processo 0034127-45.2025 · fim do dia" />
                </>
              ) : upcoming.map(u => (
                <UpcomingRow key={u.id} day={fmtDate(u.dueAt, 'dd')} month={fmtDate(u.dueAt, 'MMM').toUpperCase()} title={u.subject} sub="" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function BirthdayRow({ initials, name, area, date }: { initials:string; name:string; area:string; date:string }) {
  return (
    <div className="flex items-center gap-3 border-t border-dashed border-white/5 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-[11px] font-semibold text-gold-300">{initials}</div>
      <div className="flex-1 leading-tight"><b className="block text-sm">{name}</b><span className="text-[11px] text-ink-500">{area}</span></div>
      <span className="text-xs font-semibold text-gold-300">{date}</span>
    </div>
  );
}
function UpcomingRow({ day, month, title, sub }: { day:string; month:string; title:string; sub:string }) {
  return (
    <div className="flex items-center gap-3 border-t border-dashed border-white/5 py-2">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 leading-none text-gold-300"><b className="text-sm">{day}</b><span className="text-[9px] tracking-wider">{month}</span></div>
      <div className="flex-1 leading-tight"><b className="block text-sm">{title}</b><span className="text-[11px] text-ink-500">{sub}</span></div>
    </div>
  );
}
