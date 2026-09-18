import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isFinanceAllowed, isUnlocked } from '@/lib/finance';

async function guard() {
  if (!(await isFinanceAllowed())) return 'forbidden';
  if (!(await isUnlocked())) return 'locked';
  return null;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return NextResponse.json({ error: g }, { status: g === 'locked' ? 401 : 403 });
  const { id } = await ctx.params;
  const base = await prisma.financeBase.findUnique({
    where: { id },
    include: {
      files: { orderBy: { createdAt: 'desc' },
        select: { id: true, filename: true, mimeType: true, size: true, kind: true, status: true, error: true, createdAt: true } },
      queries: { orderBy: { createdAt: 'desc' }, take: 20 }
    }
  });
  if (!base) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ base });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return NextResponse.json({ error: g }, { status: g === 'locked' ? 401 : 403 });
  const { id } = await ctx.params;
  await prisma.financeBase.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
