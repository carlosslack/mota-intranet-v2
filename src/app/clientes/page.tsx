import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import { prisma } from '@/lib/db';

const TYPE_LABEL: Record<string,string> = { PESSOA:'Pessoa Física', EMPRESA:'Pessoa Jurídica', PODER_PUBLICO:'Poder Público' };
const AVATAR_TONE = ['bg-violet-500/15 text-violet-400','bg-amber-500/15 text-amber-400','bg-sky-500/15 text-sky-400','bg-gold-300/15 text-gold-300','bg-emerald-500/15 text-emerald-400','bg-rose-500/15 text-rose-400'];

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({ orderBy:{name:'asc'}, include:{ _count: { select:{cases:true} } } });

  return (
    <Shell active="clients">
      <div className="fade-up grid grid-cols-3 gap-4">
        {clients.map((c,i) => {
          const initials = c.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
          return (
            <div key={c.id} className="panel cursor-pointer p-5 transition hover:-translate-y-0.5 hover:border-gold-300/30">
              <div className="mb-3 flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-lg font-display text-base font-medium ${AVATAR_TONE[i % AVATAR_TONE.length]}`}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <b className="block truncate text-sm">{c.name}</b>
                  <span className="text-[10px] uppercase tracking-wider text-ink-500">{TYPE_LABEL[c.type] ?? c.type}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-y border-dashed border-white/5 py-2 text-xs text-ink-300">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-ink-500">Doc.</span>
                  {c.document ?? '—'}
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-ink-500">Casos</span>
                  {c._count.cases} ativos
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="truncate text-[11px] text-ink-500">{c.email ?? '—'}</span>
                <Icon name="arrow_forward" size={18} className="text-gold-300" />
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
