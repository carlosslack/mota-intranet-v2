import { NextRequest, NextResponse } from 'next/server';
import { isFinanceAllowed, verifyPin, setUnlockCookie } from '@/lib/finance';

export async function POST(req: NextRequest) {
  if (!(await isFinanceAllowed())) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { pin } = await req.json().catch(() => ({ pin: '' }));
  if (!verifyPin(String(pin ?? ''))) return NextResponse.json({ error: 'pin' }, { status: 401 });
  await setUnlockCookie();
  return NextResponse.json({ ok: true });
}
