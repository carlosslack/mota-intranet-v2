import { Shell } from '@/components/Shell';
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

export default async function ServicosPage() {
  const services = await prisma.service.findMany({ orderBy:[{area:'asc'},{title:'asc'}] });

  return (
    <Shell active="services">
      <div className="fade-up grid grid-cols-3 gap-4">
        {services.map(s => {
          const area = AREA_STYLE[s.area] ?? { label:s.area, bg:'bg-white/5', fg:'text-ink-300' };
          return (
            <div key={s.id} className="panel p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold tracking-wider text-gold-300">{s.sku}</span>
                <span className={`rounded-pill px-2 py-0.5 text-[10px] tracking-wider ${area.bg} ${area.fg}`}>{area.label}</span>
              </div>
              <b className="mb-2 block leading-tight">{s.title}</b>
              <p className="mb-3 text-[11px] leading-relaxed text-ink-500">{s.description}</p>
              <div className="flex items-baseline justify-between border-t border-dashed border-white/5 pt-2">
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-ink-500">A partir de</span>
                  <b className="font-display text-lg">{brl(Number(s.priceBrl))}</b>
                </div>
                <span className="cursor-pointer text-xs text-gold-300">Detalhes →</span>
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
