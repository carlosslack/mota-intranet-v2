import { signIn, auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Icon } from '@/components/Icon';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const session = await auth();
  if (session?.user) redirect('/');
  const { callbackUrl } = await searchParams;

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl panel p-8 text-center fade-up">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-xl bg-gold-gradient font-display text-2xl font-bold text-navy-900">M</div>
        <div className="mb-1 font-display text-[11px] font-bold uppercase tracking-[.24em] text-ink-100">MOTA <span className="text-gold-300">&amp;</span> ADVOGADOS</div>
        <h1 className="mb-1 mt-3 font-display text-2xl font-light">Bem-vindo(a) à Intranet</h1>
        <p className="mb-8 text-sm text-ink-500">Acesso restrito ao domínio <b className="text-gold-300">mota.adv.br</b></p>

        <form action={async () => { 'use server'; await signIn('google', { redirectTo: callbackUrl ?? '/' }); }}>
          <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[.03] px-4 py-3 text-sm font-medium transition hover:bg-white/[.06]">
            <Icon name="login" size={18} />
            Continuar com Google
          </button>
        </form>

        <p className="mt-6 text-xs text-ink-500">Ao entrar você concorda com as políticas internas.</p>
      </div>
    </div>
  );
}
