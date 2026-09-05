import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import { prisma } from '@/lib/db';
import { brl } from '@/lib/format';

const STAGES = [
  { key:'NOVO',       label:'NOVO',       accent:'#38bdf8' },
  { key:'FOLLOW_UP',  label:'FOLLOW UP',  accent:'#a78bfa' },
  { key:'PROPOSTA',   label:'PROPOSTA',   accent:'#eab308' },
  { key:'NEGOCIACAO', label:'NEGOCIAÇÃO', accent:'#d4af37' },
  { key:'GANHO',      label:'GANHO',      accent:'#34d399' },
  { key:'PERDIDO',    label:'PERDIDO',    accent:'#f87171' }
] as const;

const AREA_LABEL: Record<string,string> = {
  CONSULTIVO:'Consultivo', TRABALHISTA:'Trabalhista', CIVEL:'Cível', PREVIDENCIARIO:'Previdenciário',
  ADMINISTRATIVO:'Administrativo', PENAL:'Penal', FAMILIA_SUCESSOES:'Família & Sucessões',
  TRIBUTARIO_EMPRESARIAL:'Tributário', RECURSOS:'Recursos'
};

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy:{createdAt:'desc'} });
  const total = leads.reduce((sum,l) => sum + Number(l.valueBrl ?? 0), 0);

  return (
    <Shell active="leads">
      <div className="fade-up">
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-1.5 text-sm">
            Pipeline: <b className="text-gold-300">Prospecção Jurídica</b>
          </span>
          <span className="text-sm text-ink-500">{leads.length} leads · {brl(total)} em pipeline</span>
        </div>

        <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-2">
          {STAGES.map(st => {
            const items = leads.filter(l => l.stage === st.key);
            const value = items.reduce((s,l) => s + Number(l.valueBrl ?? 0), 0);
            return (
              <div key={st.key} className="panel flex min-h-[400px] flex-col gap-2 p-3">
                <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: st.accent }}>
                  <div>
                    <b className="text-[11px] font-semibold uppercase tracking-[.14em] text-ink-300">
                      {st.label} <span className="text-ink-500">({items.length})</span>
                    </b>
                    <div className="text-[10px] text-ink-500">{value > 0 ? brl(value) : 'sem valor'}</div>
                  </div>
                  <Icon name="add" size={16} className="cursor-pointer text-ink-500" />
                </div>
                {items.length === 0 && <div className="mt-4 text-[11px] text-ink-500 text-center">Vazio</div>}
                {items.map(l => (
                  <div key={l.id} className="rounded-lg border border-white/5 bg-navy-900/50 p-3 cursor-pointer hover:border-gold-300/30">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-[10px] font-semibold text-gold-300">
                        {(l.contactName ?? l.title).split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <b className="block truncate text-xs">{l.contactName ?? '—'}</b>
                        <span className="text-[10px] text-ink-500">{l.area ? AREA_LABEL[l.area] : ''}</span>
                      </div>
                    </div>
                    <p className="my-1 text-[12px] leading-tight text-ink-300">{l.title}</p>
                    <div className="mt-1 flex items-center justify-between border-t border-dashed border-white/5 pt-1.5">
                      <span className="font-display text-sm font-medium text-gold-300">{brl(l.valueBrl ? Number(l.valueBrl) : null)}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
