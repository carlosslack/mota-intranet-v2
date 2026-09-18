import { Shell } from '@/components/Shell';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { isFinanceAllowed, isUnlocked } from '@/lib/finance';
import { aiConfigured, embeddingsEnabled } from '@/lib/ai';
import { BaseWorkspace } from '../_components/BaseWorkspace';

export const dynamic = 'force-dynamic';

export default async function BasePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isFinanceAllowed()) || !(await isUnlocked())) redirect('/financeiro');
  const { id } = await params;
  const base = await prisma.financeBase.findUnique({
    where: { id },
    include: {
      files: { orderBy: { createdAt: 'desc' },
        select: { id: true, filename: true, mimeType: true, size: true, kind: true, status: true, error: true, createdAt: true } }
    }
  });
  if (!base) notFound();
  const files = base.files.map(f => ({ ...f, createdAt: f.createdAt.toISOString() }));
  return (
    <Shell active="finance">
      <BaseWorkspace
        base={{ id: base.id, name: base.name, description: base.description }}
        initialFiles={files}
        aiReady={aiConfigured()}
        semantic={embeddingsEnabled()}
      />
    </Shell>
  );
}
