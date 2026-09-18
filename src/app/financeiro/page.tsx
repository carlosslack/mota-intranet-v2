import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import { prisma } from '@/lib/db';
import { isFinanceAllowed, isUnlocked } from '@/lib/finance';
import { aiConfigured, embeddingsEnabled } from '@/lib/ai';
import { PinGate } from './_components/PinGate';
import { BasesGrid } from './_components/BasesGrid';

export const dynamic = 'force-dynamic';

function NoAccess() {
  return (
    <Shell active="finance">
      <div className="mx-auto max-w-md fade-up panel p-8 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-rose-500/15 text-rose-300"><Icon name="lock" size={24} /></div>
        <b className="block font-display text-lg">Acesso restrito</b>
        <p className="mt-1 text-sm text-ink-500">Este módulo é exclusivo da whitelist financeira. Fale com a administração para liberar seu acesso.</p>
      </div>
    </Shell>
  );
}

export default async function FinanceiroPage() {
  if (!(await isFinanceAllowed())) return <NoAccess />;
  if (!(await isUnlocked())) {
    return <Shell active="finance"><PinGate /></Shell>;
  }
  const bases = await prisma.financeBase.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { files: true } } }
  });
  const plain = bases.map(b => ({ id: b.id, name: b.name, description: b.description, files: b._count.files, updatedAt: b.updatedAt.toISOString() }));
  return (
    <Shell active="finance">
      <BasesGrid initial={plain} aiReady={aiConfigured()} semantic={embeddingsEnabled()} />
    </Shell>
  );
}
