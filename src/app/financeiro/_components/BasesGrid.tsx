'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

type Base = { id: string; name: string; description: string | null; files: number; updatedAt: string };

export function BasesGrid({ initial, aiReady, semantic }: { initial: Base[]; aiReady: boolean; semantic: boolean }) {
  const [bases, setBases] = useState<Base[]>(initial);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function create() {
    if (!name.trim()) return;
    setBusy(true);
    const res = await fetch('/api/financeiro/bases', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc })
    });
    setBusy(false);
    if (res.ok) { setName(''); setDesc(''); setCreating(false); router.refresh(); const { base } = await res.json(); setBases(b => [{ id: base.id, name: base.name, description: base.description, files: 0, updatedAt: base.updatedAt }, ...b]); }
  }

  async function remove(id: string) {
    if (!confirm('Excluir esta base e todos os seus arquivos?')) return;
    setBases(b => b.filter(x => x.id !== id));
    await fetch(`/api/financeiro/bases/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="fade-up">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="rounded-lg border border-white/10 bg-white/[.03] px-3 py-1.5 text-sm">
          Bases de dados <b className="text-gold-300">DataDocs</b>
        </span>
        <span className="text-sm text-ink-500">{bases.length} base{bases.length !== 1 ? 's' : ''}</span>
        <div className="ml-auto flex items-center gap-2 text-[11px]">
          <StatusChip ok={aiReady} label={aiReady ? 'IA conectada' : 'IA não configurada'} icon="smart_toy" />
          <StatusChip ok={semantic} neutral={!semantic} label={semantic ? 'Busca semântica ativa' : 'RAG desligado'} icon="manage_search" />
          <button onClick={() => setCreating(v => !v)}
            className="flex items-center gap-2 rounded-lg bg-gold-gradient px-3.5 py-2 text-[13px] font-semibold text-navy-900 shadow-gold-glow hover:brightness-110">
            <Icon name="add" size={16} /> Nova base
          </button>
        </div>
      </div>

      {creating && (
        <div className="panel mb-4 p-5 fade-up">
          <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
            <label className="block">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">Nome da base</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Notas Fiscais 2026" className="fin-input" autoFocus />
            </label>
            <label className="block">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">Descrição (opcional)</div>
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="O que essa base guarda" className="fin-input" />
            </label>
            <button onClick={create} disabled={busy || !name.trim()}
              className="rounded-lg bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-navy-900 disabled:opacity-50">
              {busy ? 'Criando…' : 'Criar base'}
            </button>
          </div>
        </div>
      )}

      {bases.length === 0 && !creating && (
        <div className="panel grid place-items-center p-12 text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/[.04] text-ink-500"><Icon name="database" size={28} /></div>
          <b className="font-display text-lg">Nenhuma base ainda</b>
          <p className="mt-1 max-w-sm text-sm text-ink-500">Crie uma base, dê um nome à categoria (ex.: “Prestação de contas”) e envie seus arquivos. A IA cuida da leitura.</p>
          <button onClick={() => setCreating(true)} className="mt-4 flex items-center gap-2 rounded-lg bg-gold-gradient px-4 py-2 text-sm font-semibold text-navy-900"><Icon name="add" size={16} /> Nova base</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bases.map(b => (
          <div key={b.id} className="panel group relative flex flex-col p-5 transition-colors hover:border-gold-300/35">
            <Link href={`/financeiro/${b.id}`} className="flex-1">
              <div className="mb-3 flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold-300/15 text-gold-300"><Icon name="folder" size={22} /></div>
                <div className="min-w-0">
                  <b className="block truncate font-display text-base leading-tight">{b.name}</b>
                  <span className="text-[11px] text-ink-500">{b.files} arquivo{b.files !== 1 ? 's' : ''}</span>
                </div>
              </div>
              {b.description && <p className="line-clamp-2 text-sm text-ink-300">{b.description}</p>}
            </Link>
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-white/5 pt-3">
              <Link href={`/financeiro/${b.id}`} className="flex items-center gap-1 text-[12px] font-semibold text-gold-300">
                Abrir <Icon name="arrow_forward" size={14} />
              </Link>
              <button onClick={() => remove(b.id)} className="text-ink-700 opacity-0 transition-opacity hover:text-rose-300 group-hover:opacity-100" aria-label="Excluir">
                <Icon name="delete" size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`.fin-input{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:.6rem .85rem;color:#f2f2f5;font-family:inherit;font-size:.9rem;outline:none;transition:border-color .15s}.fin-input:focus{border-color:#d4af37;box-shadow:0 0 0 3px rgba(212,175,55,.15)}`}</style>
    </div>
  );
}

function StatusChip({ ok, neutral, label, icon }: { ok: boolean; neutral?: boolean; label: string; icon: string }) {
  const cls = ok ? 'bg-emerald-500/15 text-emerald-300' : neutral ? 'bg-white/5 text-ink-500' : 'bg-amber-500/15 text-amber-300';
  return <span className={`flex items-center gap-1 rounded-pill px-2.5 py-1 font-semibold ${cls}`}><Icon name={icon} size={13} /> {label}</span>;
}
