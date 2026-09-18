import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isFinanceAllowed, isUnlocked } from '@/lib/finance';

async function guard() {
  if (!(await isFinanceAllowed())) return 'forbidden';
  if (!(await isUnlocked())) return 'locked';
  return null;
}

export async function GET() {
  const g = await guard();
  if (g) return NextResponse.json({ error: g }, { status: g === 'locked' ? 401 : 403 });
  const bases = await prisma.financeBase.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { files: true } } }
  });
  return NextResponse.json({ bases });
}

export async function POST(req: NextRequest) {
  const g = await guard();
  if (g) return NextResponse.json({ error: g }, { status: g === 'locked' ? 401 : 403 });
  const session = await auth();
  const uid = (session?.user as any)?.id;
  const { name, description } = await req.json().catch(() => ({}));
  const nm = String(name ?? '').trim();
  if (!nm) return NextResponse.json({ error: 'name' }, { status: 400 });
  const base = await prisma.financeBase.create({
    data: { name: nm, description: String(description ?? '').trim() || null, ownerId: uid }
  });
  return NextResponse.json({ base }, { status: 201 });
}
