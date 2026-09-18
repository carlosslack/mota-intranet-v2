import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';
import { auth } from '@/lib/auth';

const PIN = process.env.FINANCE_PIN ?? '';
const SECRET = process.env.AUTH_SECRET ?? 'mota-finance';
const COOKIE = 'finance_unlocked';
const TTL_MS = 1000 * 60 * 60 * 8; // 8h

/** E-mails autorizados (env), sempre + qualquer ADMIN. */
export function financeWhitelist(): string[] {
  return (process.env.FINANCE_WHITELIST ?? '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

export async function isFinanceAllowed(): Promise<boolean> {
  const session = await auth();
  const user = session?.user as any;
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  const email = (user.email ?? '').toLowerCase();
  return financeWhitelist().includes(email);
}

export function verifyPin(pin: string): boolean {
  if (!PIN || pin.length !== PIN.length) return false;
  const a = Buffer.from(pin), b = Buffer.from(PIN);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sign(exp: number): string {
  return createHmac('sha256', SECRET).update(`finance:${exp}`).digest('hex');
}

export async function setUnlockCookie(): Promise<void> {
  const exp = Date.now() + TTL_MS;
  const jar = await cookies();
  jar.set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: Math.floor(TTL_MS / 1000)
  });
}

export async function isUnlocked(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const [expStr, sig] = raw.split('.');
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return sig === sign(exp);
}
