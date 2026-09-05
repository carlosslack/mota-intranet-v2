import { Shell } from '@/components/Shell';
import { prisma } from '@/lib/db';
import { timeAgo } from '@/lib/format';

const TAG_STYLE: Record<string, string> = {
  GERAL: 'bg-gold-300/15 text-gold-300',
  ADMIN: 'bg-sky-500/15 text-sky-300',
  NOVA_AREA: 'bg-emerald-500/15 text-emerald-300',
  CELEBRACAO: 'bg-rose-500/15 text-rose-300'
};

export default async function ComunicadosPage() {
  const items = await prisma.announcement.findMany({ orderBy:{createdAt:'desc'}, include:{author:true} });

  return (
    <Shell active="news">
      <div className="mx-auto max-w-3xl fade-up">
        {items.length === 0 && <p className="p-6 text-center text-sm text-ink-500">Nenhum comunicado.</p>}
        {items.map(n => (
          <div key={n.id} className="panel mb-3 p-5">
            <div className="mb-2 flex items-center gap-3 text-[11px] text-ink-500">
              {n.tag && <span className={`rounded-pill px-2 py-0.5 uppercase tracking-wider ${TAG_STYLE[n.tag] ?? 'bg-white/5 text-ink-300'}`}>{n.tag}</span>}
              <span>{timeAgo(n.createdAt)}</span>
              <span className="ml-auto">por {n.author.name ?? n.author.email}</span>
            </div>
            <h3 className="mb-2 font-display text-lg font-medium">{n.title}</h3>
            <p className="text-sm leading-relaxed text-ink-300">{n.body}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}
