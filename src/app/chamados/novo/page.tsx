import { Shell } from '@/components/Shell';
import { Icon } from '@/components/Icon';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { nextTicketProtocol } from '@/lib/protocol';

async function createTicket(formData: FormData) {
  'use server';
  const session = await auth();
  const uid = (session?.user as any)?.id;
  if (!uid) throw new Error('unauth');

  const subject = String(formData.get('subject') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? 'OUTRO') as any;
  const priority = String(formData.get('priority') ?? 'MEDIA') as any;
  if (!subject || !description) throw new Error('required');

  const protocol = await nextTicketProtocol();
  const adminEmail = (process.env.GOOGLE_ADMIN_EMAIL ?? 'ti@mota.adv.br').toLowerCase();
  const assignee = await prisma.user.findUnique({ where: { email: adminEmail } });

  const t = await prisma.ticket.create({ data:{
    protocol, subject, description, category, priority,
    requesterId: uid, assigneeId: assignee?.id ?? null
  }});
  redirect(`/chamados/${t.id}`);
}

const CATEGORIES = [
  ['REDE','Rede / Internet'],['IMPRESSORA','Impressora'],['SOFTWARE_JURIDICO','Software jurídico'],
  ['ACESSO','Acesso / Senha'],['HARDWARE','Hardware'],['EMAIL','E-mail'],['OUTRO','Outro']
] as const;
const PRIORITIES = [['BAIXA','Baixa'],['MEDIA','Média'],['ALTA','Alta'],['URGENTE','Urgente']] as const;

export default function NovoChamadoPage() {
  return (
    <Shell active="ticketNew">
      <div className="mx-auto max-w-2xl fade-up">
        <div className="panel p-8">
          <p className="mb-5 text-sm text-ink-300">Descreva o problema com detalhes — quanto mais contexto, mais rápido o TI resolve.</p>
          <form action={createTicket} className="space-y-4">
            <Field label="Assunto">
              <input name="subject" required maxLength={140} placeholder="Ex.: Impressora do 3º andar fora do ar" className="input" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoria">
                <select name="category" defaultValue="OUTRO" className="input">
                  {CATEGORIES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Prioridade">
                <select name="priority" defaultValue="MEDIA" className="input">
                  {PRIORITIES.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Descrição">
              <textarea name="description" required rows={6} placeholder="O que está acontecendo? O que já tentou?" className="input resize-y" />
            </Field>

            <div className="flex items-center gap-2 rounded-lg border border-dashed border-gold-300/30 bg-gold-300/[.05] px-3 py-2">
              <Icon name="attach_file" size={20} className="text-gold-300" />
              <span className="text-sm text-ink-300">Anexar arquivos (em breve)</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Icon name="shield" size={14} className="text-gold-300" />
                Envio direto para ti@mota.adv.br
              </div>
              <div className="flex gap-2">
                <Link href="/chamados" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-ink-300">Cancelar</Link>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900 shadow-gold-glow hover:brightness-110">
                  <Icon name="send" size={16} /> Enviar chamado
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`.input{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.6rem .85rem;color:#f2f2f5;font-family:inherit;font-size:.9rem;outline:none;transition:border-color .15s}.input:focus{border-color:#d4af37;box-shadow:0 0 0 3px rgba(212,175,55,.15)}`}</style>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">{label}</div>
      {children}
    </label>
  );
}
