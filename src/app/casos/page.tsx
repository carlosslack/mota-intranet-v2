import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import { prisma } from '@/lib/db';
import { brl } from '@/lib/format';

const AREA_STYLE: Record<string, { label:string; bg:string; fg:string }> = {
  CONSULTIVO:            { label:'CONSULTIVO',       bg:'bg-gold-300/15',   fg:'text-gold-300' },
  TRABALHISTA:           { label:'TRABALHISTA',      bg:'bg-violet-500/15', fg:'text-violet-400' },
  CIVEL:                 { label:'CÍVEL',            bg:'bg-sky-500/15',    fg:'text-sky-400' },
  PREVIDENCIARIO:        { label:'PREVIDENCIÁRIO',   bg:'bg-emerald-500/15',fg:'text-emerald-400' },
  ADMINISTRATIVO:        { label:'ADMINISTRATIVO',   bg:'bg-amber-500/15',  fg:'text-amber-400' },
  PENAL:                 { label:'PENAL',            bg:'bg-rose-500/15',   fg:'text-rose-400' },
  FAMILIA_SUCESSOES:     { label:'FAMÍLIA & SUC.',   bg:'bg-rose-500/15',   fg:'text-rose-300' },
  TRIBUTARIO_EMPRESARIAL:{ label:'TRIBUTÁRIO',       bg:'bg-slate-500/15',  fg:'text-slate-300' },
  RECURSOS:              { label:'RECURSOS',         bg:'bg-sky-500/15',    fg:'text-sky-300' }
};

const TIMELINE = [
  { title:'Petição inicial protocolada', sub:'PJe · confirmação 14:02',    when:'Hoje',    icon:'assignment', bg:'bg-gold-300/15', color:'text-gold-300' },
  { title:'Reunião com o sindicato',      sub:'Meet · 45 min · 4 pessoas',  when:'Ontem',   icon:'videocam',   bg:'bg-sky-500/15',  color:'text-sky-400' },
  { title:'E-mail: parecer técnico',      sub:'De: perito@sindifisco.org', when:'02/09',   icon:'mail',       bg:'bg-emerald-500/15', color:'text-emerald-400' },
  { title:'Prazo: contrarrazões',         sub:'Vence 12/09 · 15 dias úteis', when:'27/08', icon:'schedule',   bg:'bg-amber-500/15', color:'text-amber-400' },
  { title:'Caso criado por Ana Mota',     sub:'Origem: Lead do Instagram',  when:'20/08',   icon:'add_task',   bg:'bg-white/5', color:'text-ink-500' }
];

export default async function CasosPage() {
  const cases = await prisma.case.findMany({ orderBy:{createdAt:'desc'}, include:{client:true} });

  return (
    <Shell active="cases">
      <div className="fade-up grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <b className="font-display text-base">Casos ativos</b>
            <div className="flex gap-2 text-xs">
              <span className="rounded-pill bg-gold-300/15 px-3 py-0.5 text-gold-300">Todos</span>
              <span className="text-ink-500">Meus</span>
              <span className="text-ink-500">Encerrados</span>
            </div>
          </div>
          {cases.length === 0 && <p className="p-10 text-center text-sm text-ink-500">Nenhum caso ativo ainda.</p>}
          {cases.map(c => {
            const area = AREA_STYLE[c.area] ?? { label: c.area, bg:'bg-white/5', fg:'text-ink-300' };
            return (
              <div key={c.id} className="cursor-pointer border-b border-white/5 px-5 py-4 hover:bg-white/[.02]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] tracking-wider text-gold-300">{c.cnj ?? '—'}</div>
                    <b className="block py-1 text-sm leading-tight">{c.title}</b>
                    <div className="flex items-center gap-2 text-[11px] text-ink-500">
                      <span>{c.client.name}</span><span>•</span><span>{c.court ?? '—'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-pill px-2 py-0.5 text-[10px] tracking-wider ${area.bg} ${area.fg}`}>{area.label}</span>
                    <div className="mt-1 font-display text-base">{brl(c.valueBrl ? Number(c.valueBrl) : null)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="timeline" size={18} className="text-gold-300" />
            <b className="font-display">Timeline · Reajuste Servidores</b>
          </div>
          {TIMELINE.map((e,i) => (
            <div key={i} className="flex gap-3 py-2">
              <div className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg ${e.bg} ${e.color}`}>
                <Icon name={e.icon} size={16} />
              </div>
              <div className="flex-1 leading-tight">
                <div className="flex items-center justify-between">
                  <b className="text-xs">{e.title}</b>
                  <span className="text-[10px] text-ink-500">{e.when}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-500">{e.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
