import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Icon } from "@/components/Icon";

export default async function EntrarPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="glass rounded-3xl w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl glass flex items-center justify-center">
            <span className="font-display text-gold-300 text-2xl font-semibold">
              M
            </span>
          </div>
          <h1 className="font-display text-2xl text-gold-50">
            MOTA &amp; Advogados
          </h1>
          <p className="text-sm text-gold-50/60">
            Acesso restrito ao domínio <strong>mota.adv.br</strong>
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gold-300 text-navy-900 font-semibold py-3 hover:bg-gold-100 transition"
          >
            <Icon name="login" />
            Entrar com Google
          </button>
        </form>

        <p className="text-[11px] text-center text-gold-50/40">
          Ao entrar você concorda com as políticas internas.
        </p>
      </div>
    </main>
  );
}
